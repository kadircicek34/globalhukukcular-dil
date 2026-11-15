"""GH Dil membership application and e-Devlet document fields.

Revision ID: 0061_membership
Revises: 0060_checkout_customer_request
"""

import sqlalchemy as sa

from alembic import op

revision = "0061_membership"
down_revision = "0060_checkout_customer_request"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column(
            "membership_status",
            sa.String(length=20),
            nullable=False,
            server_default="approved",
        ),
    )
    op.add_column("users", sa.Column("birth_date", sa.Date(), nullable=True))
    op.add_column("users", sa.Column("law_status", sa.String(length=20), nullable=True))
    op.add_column("users", sa.Column("law_school", sa.String(length=200), nullable=True))
    op.add_column("users", sa.Column("graduation_year", sa.Integer(), nullable=True))
    op.add_column("users", sa.Column("phone", sa.String(length=30), nullable=True))
    op.add_column("users", sa.Column("e_devlet_document_path", sa.String(length=500), nullable=True))
    op.add_column("users", sa.Column("e_devlet_document_name", sa.String(length=255), nullable=True))
    op.add_column("users", sa.Column("e_devlet_document_mime", sa.String(length=100), nullable=True))
    op.add_column("users", sa.Column("kvkk_accepted_at", sa.DateTime(), nullable=True))
    op.add_column("users", sa.Column("application_submitted_at", sa.DateTime(), nullable=True))
    op.add_column("users", sa.Column("membership_note", sa.Text(), nullable=True))
    op.add_column("users", sa.Column("membership_reviewed_at", sa.DateTime(), nullable=True))
    op.add_column("users", sa.Column("membership_reviewed_by", sa.Integer(), nullable=True))
    op.create_index("ix_users_membership_status", "users", ["membership_status"])


def downgrade() -> None:
    op.drop_index("ix_users_membership_status", table_name="users")
    op.drop_column("users", "membership_reviewed_by")
    op.drop_column("users", "membership_reviewed_at")
    op.drop_column("users", "membership_note")
    op.drop_column("users", "application_submitted_at")
    op.drop_column("users", "kvkk_accepted_at")
    op.drop_column("users", "e_devlet_document_mime")
    op.drop_column("users", "e_devlet_document_name")
    op.drop_column("users", "e_devlet_document_path")
    op.drop_column("users", "phone")
    op.drop_column("users", "graduation_year")
    op.drop_column("users", "law_school")
    op.drop_column("users", "law_status")
    op.drop_column("users", "birth_date")
    op.drop_column("users", "membership_status")
