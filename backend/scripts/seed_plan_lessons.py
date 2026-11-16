"""Seed deterministic demo lessons for an existing study plan.

This is an operational fallback for deployments where the configured LLM is
unavailable or too slow for synchronous lesson generation. It creates valid
A1-level lesson content and exercises for every day in the plan's weekly_plan,
so the dashboard's /today flow can return a startable lesson immediately.

Usage (inside the backend container):
    python scripts/seed_plan_lessons.py --plan-id 1
"""

from __future__ import annotations

import argparse
import asyncio
from typing import Any

from sqlalchemy import select

from app.core.database import AsyncSessionLocal
from app.models.lesson import Exercise, Lesson
from app.models.study_plan import StudyPlan
from app.schemas.lessons import LessonContent

# A small A1 bank. The seeder rotates through it so different days are not
# identical while keeping every exercise deterministic and answerable offline.
MCQ_BANK: list[dict[str, Any]] = [
    {
        "question": "I ___ a law student.",
        "options": ["am", "is", "are", "be"],
        "correct": "am",
        "explanation": "Use 'am' with I.",
    },
    {
        "question": "She ___ from Türkiye.",
        "options": ["is", "am", "are", "be"],
        "correct": "is",
        "explanation": "Use 'is' with he/she/it.",
    },
    {
        "question": "They ___ in the classroom.",
        "options": ["are", "is", "am", "be"],
        "correct": "are",
        "explanation": "Use 'are' with they.",
    },
    {
        "question": "___ is my colleague.",
        "options": ["He", "They", "We", "I"],
        "correct": "He",
        "explanation": "A singular subject pronoun is needed here.",
    },
    {
        "question": "We ___ ready to learn.",
        "options": ["are", "is", "am", "be"],
        "correct": "are",
        "explanation": "Use 'are' with we.",
    },
    {
        "question": "What is your name? — ___ name is Ayşe.",
        "options": ["My", "Your", "His", "Her"],
        "correct": "My",
        "explanation": "The speaker answers about their own name.",
    },
    {
        "question": "Hello, how ___ you?",
        "options": ["are", "is", "am", "be"],
        "correct": "are",
        "explanation": "The fixed greeting is 'How are you?'.",
    },
    {
        "question": "I am ___ Istanbul.",
        "options": ["from", "at", "on", "in"],
        "correct": "from",
        "explanation": "Use 'from' to state origin.",
    },
    {
        "question": "This is a contract. ___ is important.",
        "options": ["It", "They", "We", "I"],
        "correct": "It",
        "explanation": "A contract is singular and non-human.",
    },
    {
        "question": "The lawyer ___ in court.",
        "options": ["works", "work", "working", "worked"],
        "correct": "works",
        "explanation": "Use the -s form with a singular subject in the present simple.",
    },
]

LISTENING_TEXT = (
    "Hello. My name is Ayşe. I am a law student from Istanbul. "
    "I am twenty years old. I study at the university. Nice to meet you."
)


def _mcq(index: int) -> dict[str, Any]:
    item = MCQ_BANK[index % len(MCQ_BANK)]
    return {
        "type": "multiple_choice",
        "question": item["question"],
        "options": list(item["options"]),
        "correct": item["correct"],
        "explanation": item["explanation"],
    }


def build_content(plan: StudyPlan, week: dict[str, Any], day: dict[str, Any]) -> dict[str, Any]:
    theme = str(week.get("theme") or "Everyday English")
    objectives = [str(item) for item in (day.get("objectives") or [])][:3]
    grammar = [str(item) for item in (day.get("grammar_points") or [])][:4]
    lesson_type = str(day.get("lesson_type") or "grammar")
    title = str(day.get("title") or theme)
    unit_id = day.get("unit_id")

    explanation_text = (
        f"This lesson focuses on {theme}. "
        + (f"Objectives: {', '.join(objectives)}. " if objectives else "")
        + (f"Grammar: {', '.join(grammar)}." if grammar else "")
    )
    exercises: list[dict[str, Any]] = []
    if lesson_type == "listening":
        exercises.append(
            {
                "type": "listening",
                "question": "What is the speaker's job?",
                "options": ["Law student", "Doctor", "Teacher", "Engineer"],
                "correct": "Law student",
                "explanation": "The speaker says: I am a law student.",
                "listening_text": LISTENING_TEXT,
            }
        )
    offset = int(day.get("day", 1)) + int(week.get("week", 1))
    for index in range(5):
        exercises.append(_mcq(offset + index))

    content = {
        "lesson_type": lesson_type,
        "title": title,
        "cefr_level": plan.cefr_level,
        "explanation": {
            "text": explanation_text,
            "key_points": objectives or [theme],
            "examples": [
                {
                    "sentence": "Hello, my name is Ayşe. I am a law student.",
                    "note": "A simple self-introduction.",
                },
                {
                    "sentence": "I am from Istanbul. Nice to meet you.",
                    "note": "Say where you are from and greet the other person.",
                },
            ],
        },
        "native_explanation": {
            "text": f"Bu derste {theme} konusunu çalışacaksınız. "
            "Kısa örneklerle kendinizi tanıtmayı ve temel soruları yanıtlamayı öğreneceksiniz.",
            "key_points": objectives or [theme],
            "examples": [
                {
                    "sentence": "Merhaba, benim adım Ayşe. Hukuk öğrencisiyim.",
                    "note": "Kendinizi tanıtırken adınızı ve mesleğinizi söyleyin.",
                }
            ],
        },
        "exercises": exercises,
        "vocabulary": [
            {
                "word": "law student",
                "definition": "a person who studies law",
                "example": "She is a law student.",
                "translation": "hukuk öğrencisi",
            },
            {
                "word": "colleague",
                "definition": "a person you work with",
                "example": "He is my colleague.",
                "translation": "meslektaş",
            },
            {
                "word": "from",
                "definition": "used to show origin",
                "example": "I am from Istanbul.",
                "translation": "-den / -dan",
            },
        ],
        "grammar_refs": grammar,
        "unit_id": unit_id,
    }
    # Fail fast if a template ever violates the API contract.
    LessonContent.model_validate(content)
    return content


async def seed(plan_id: int) -> None:
    async with AsyncSessionLocal() as db:
        plan = (
            await db.execute(select(StudyPlan).where(StudyPlan.id == plan_id))
        ).scalar_one_or_none()
        if plan is None:
            raise SystemExit(f"plan {plan_id} not found")
        generated = plan.generated_plan or {}
        weekly = generated.get("weekly_plan") or []
        created = 0
        for week in weekly:
            for day in week.get("days", []):
                title = str(day.get("title") or "")
                week_number = int(week.get("week", 1))
                day_number = int(day.get("day", 1))
                if not title:
                    continue
                existing = (
                    await db.execute(
                        select(Lesson).where(
                            Lesson.study_plan_id == plan.id,
                            Lesson.week_number == week_number,
                            Lesson.day_number == day_number,
                            Lesson.title == title,
                        )
                    )
                ).scalar_one_or_none()
                if existing is not None:
                    continue
                content = build_content(plan, week, day)
                lesson = Lesson(
                    study_plan_id=plan.id,
                    title=title,
                    lesson_type=str(day.get("lesson_type") or "grammar"),
                    cefr_level=plan.cefr_level,
                    week_number=week_number,
                    day_number=day_number,
                    unit_id=day.get("unit_id"),
                    content=content,
                    is_completed=False,
                )
                db.add(lesson)
                await db.flush()
                for exercise in content["exercises"]:
                    db.add(
                        Exercise(
                            lesson_id=lesson.id,
                            exercise_type=exercise["type"],
                            question=exercise["question"],
                            options=exercise.get("options") or [],
                            correct_answer=exercise["correct"],
                            explanation=exercise.get("explanation"),
                        )
                    )
                created += 1
        await db.commit()
        print(f"seeded {created} lessons for plan {plan_id}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--plan-id", type=int, default=1)
    args = parser.parse_args()
    asyncio.run(seed(args.plan_id))
