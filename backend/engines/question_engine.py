"""
Question Engine — converts parsed template sections into dynamic question flows.

Maps each section to a targeted question set. Questions are derived from the
ACTUAL parsed template (its sections, headings, and instructions) — not hardcoded.

The section-type detection uses fuzzy keyword matching so it works with any
resume template, not just those using standard section names.
"""
from __future__ import annotations

import logging
from typing import Optional

from backend.models.schemas import (
    ParsedTemplate, Section, QuestionCard, QuestionField,
    QuestionFlow, QuestionType, TemplateInstruction
)
from backend.engines.template_engine import get_section_constraints

logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────
# Section type detection — keyword maps
# ─────────────────────────────────────────────
SECTION_KEYWORDS: dict[str, list[str]] = {
    "personal": [
        "personal", "contact", "header", "name", "info", "details",
        "profile", "about me", "introduction"
    ],
    "summary": [
        "summary", "executive summary", "objective", "overview",
        "career objective", "professional summary", "profile summary"
    ],
    "experience": [
        "experience", "employment", "work history", "professional experience",
        "career history", "positions", "work experience", "internship"
    ],
    "education": [
        "education", "academic", "qualification", "degree", "university",
        "college", "schooling", "academic background"
    ],
    "skills": [
        "skills", "technical skills", "competencies", "expertise",
        "technologies", "tools", "proficiencies", "stack", "languages"
    ],
    "projects": [
        "projects", "portfolio", "key projects", "notable projects",
        "personal projects", "open source"
    ],
    "awards": [
        "awards", "achievements", "certifications", "honors", "recognition",
        "accomplishments", "certificates", "credentials"
    ],
    "volunteer": [
        "volunteer", "volunteering", "community", "extracurricular",
        "activities", "leadership"
    ],
    "publications": [
        "publications", "papers", "research", "articles", "journals"
    ],
    "references": [
        "references", "referees", "reference available"
    ],
}


def detect_section_type(section_name: str) -> str:
    """
    Detect the semantic type of a section from its name via keyword matching.
    Returns one of the SECTION_KEYWORDS keys, or "generic".
    """
    name_lower = section_name.lower()
    for section_type, keywords in SECTION_KEYWORDS.items():
        if any(kw in name_lower for kw in keywords):
            return section_type
    return "generic"


# ─────────────────────────────────────────────
# Question templates per section type
# ─────────────────────────────────────────────

def _personal_questions(section: Section, constraints: TemplateInstruction) -> list[QuestionField]:
    return [
        QuestionField(
            id=f"{section.id}_full_name",
            label="Full Name",
            placeholder_hint="e.g. Priya Sharma",
            question_type=QuestionType.TEXT,
            ai_context="The candidate's full name for the resume header.",
            required=True,
        ),
        QuestionField(
            id=f"{section.id}_job_title",
            label="Current / Target Job Title",
            placeholder_hint="e.g. Senior Software Engineer",
            question_type=QuestionType.TEXT,
            ai_context="The job title shown under the name on the resume.",
            required=False,
        ),
        QuestionField(
            id=f"{section.id}_email",
            label="Email Address",
            placeholder_hint="e.g. priya@example.com",
            question_type=QuestionType.TEXT,
            ai_context="Professional email address.",
            required=True,
        ),
        QuestionField(
            id=f"{section.id}_phone",
            label="Phone Number",
            placeholder_hint="e.g. +91 98765 43210",
            question_type=QuestionType.TEXT,
            ai_context="Phone number with country code.",
            required=True,
        ),
        QuestionField(
            id=f"{section.id}_linkedin",
            label="LinkedIn URL",
            placeholder_hint="e.g. linkedin.com/in/priyasharma",
            question_type=QuestionType.TEXT,
            ai_context="LinkedIn profile URL (just the path, no https).",
            required=False,
        ),
        QuestionField(
            id=f"{section.id}_github",
            label="GitHub / Portfolio URL",
            placeholder_hint="e.g. github.com/priyasharma",
            question_type=QuestionType.TEXT,
            ai_context="GitHub or portfolio URL.",
            required=False,
        ),
        QuestionField(
            id=f"{section.id}_location",
            label="Location (City, Country)",
            placeholder_hint="e.g. Bengaluru, India",
            question_type=QuestionType.TEXT,
            ai_context="City and country of residence.",
            required=False,
        ),
    ]


def _summary_questions(section: Section, constraints: TemplateInstruction) -> list[QuestionField]:
    hint = "3–4 sentences summarizing your experience, skills, and value"
    if constraints.min_lines and constraints.max_lines:
        hint = f"Write {constraints.min_lines}–{constraints.max_lines} lines"
    elif constraints.min_lines:
        hint = f"Write at least {constraints.min_lines} lines"
    elif constraints.max_lines:
        hint = f"Write up to {constraints.max_lines} lines"

    return [
        QuestionField(
            id=f"{section.id}_role_applying_for",
            label="Role / Position Applying For",
            placeholder_hint="e.g. Full Stack Developer at a product startup",
            question_type=QuestionType.TEXT,
            ai_context="The job role the candidate is targeting.",
            required=True,
        ),
        QuestionField(
            id=f"{section.id}_years_experience",
            label="Years of Experience",
            placeholder_hint="e.g. 5 years",
            question_type=QuestionType.TEXT,
            ai_context="Total years of professional experience.",
            required=True,
        ),
        QuestionField(
            id=f"{section.id}_key_skills",
            label="Key Skills / Technologies",
            placeholder_hint="e.g. React, Node.js, Python, AWS",
            question_type=QuestionType.TEXT,
            ai_context="Core technical skills to highlight in the summary.",
            required=True,
        ),
        QuestionField(
            id=f"{section.id}_summary_text",
            label="Executive Summary",
            placeholder_hint=hint,
            question_type=QuestionType.TEXTAREA,
            ai_context="A concise, impactful professional summary for the top of the resume.",
            constraints=constraints,
            required=True,
        ),
    ]


def _experience_questions(section: Section, constraints: TemplateInstruction) -> list[QuestionField]:
    bullet_hint = "One bullet point per line, starting with an action verb"
    if constraints.min_bullets and constraints.max_bullets:
        bullet_hint = f"{constraints.min_bullets}–{constraints.max_bullets} bullet points, each starting with an action verb"
    elif constraints.max_bullets:
        bullet_hint = f"Up to {constraints.max_bullets} bullet points"

    return [
        QuestionField(
            id=f"{section.id}_company",
            label="Company Name",
            placeholder_hint="e.g. Google India Pvt. Ltd.",
            question_type=QuestionType.TEXT,
            ai_context="Name of the employer / company.",
            required=True,
        ),
        QuestionField(
            id=f"{section.id}_role",
            label="Job Title / Role",
            placeholder_hint="e.g. Software Engineer II",
            question_type=QuestionType.TEXT,
            ai_context="Exact job title held at this company.",
            required=True,
        ),
        QuestionField(
            id=f"{section.id}_duration",
            label="Duration (Start – End)",
            placeholder_hint="e.g. Jan 2022 – Present",
            question_type=QuestionType.TEXT,
            ai_context="Employment period.",
            required=True,
        ),
        QuestionField(
            id=f"{section.id}_location_co",
            label="Location",
            placeholder_hint="e.g. Bengaluru, India",
            question_type=QuestionType.TEXT,
            ai_context="City/country of the job.",
            required=False,
        ),
        QuestionField(
            id=f"{section.id}_responsibilities",
            label="Responsibilities & Achievements",
            placeholder_hint=bullet_hint,
            question_type=QuestionType.TEXTAREA,
            ai_context="Key responsibilities and measurable achievements in this role.",
            constraints=constraints,
            required=True,
        ),
    ]


def _education_questions(section: Section, constraints: TemplateInstruction) -> list[QuestionField]:
    return [
        QuestionField(
            id=f"{section.id}_degree",
            label="Degree / Qualification",
            placeholder_hint="e.g. B.Tech in Computer Science",
            question_type=QuestionType.TEXT,
            ai_context="Degree name and field of study.",
            required=True,
        ),
        QuestionField(
            id=f"{section.id}_institution",
            label="College / University Name",
            placeholder_hint="e.g. IIT Bombay",
            question_type=QuestionType.TEXT,
            ai_context="Institution name.",
            required=True,
        ),
        QuestionField(
            id=f"{section.id}_year",
            label="Year of Graduation",
            placeholder_hint="e.g. 2021",
            question_type=QuestionType.TEXT,
            ai_context="Year completed or expected graduation.",
            required=True,
        ),
        QuestionField(
            id=f"{section.id}_grade",
            label="Grade / CGPA (optional)",
            placeholder_hint="e.g. 8.5 / 10 or First Class",
            question_type=QuestionType.TEXT,
            ai_context="Academic performance indicator.",
            required=False,
        ),
    ]


def _skills_questions(section: Section, constraints: TemplateInstruction) -> list[QuestionField]:
    return [
        QuestionField(
            id=f"{section.id}_languages",
            label="Programming Languages",
            placeholder_hint="e.g. Python, TypeScript, Java, Go",
            question_type=QuestionType.TEXT,
            ai_context="Programming languages the candidate is proficient in.",
            required=False,
        ),
        QuestionField(
            id=f"{section.id}_frameworks",
            label="Frameworks & Libraries",
            placeholder_hint="e.g. React, Next.js, FastAPI, Spring Boot",
            question_type=QuestionType.TEXT,
            ai_context="Key frameworks and libraries used.",
            required=False,
        ),
        QuestionField(
            id=f"{section.id}_databases",
            label="Databases",
            placeholder_hint="e.g. PostgreSQL, MongoDB, Redis",
            question_type=QuestionType.TEXT,
            ai_context="Databases and data stores the candidate works with.",
            required=False,
        ),
        QuestionField(
            id=f"{section.id}_tools",
            label="Tools & Platforms",
            placeholder_hint="e.g. Docker, Kubernetes, AWS, Git, Jira",
            question_type=QuestionType.TEXT,
            ai_context="DevOps tools, cloud platforms, and development tools.",
            required=False,
        ),
        QuestionField(
            id=f"{section.id}_aiml",
            label="AI / ML Skills (optional)",
            placeholder_hint="e.g. TensorFlow, PyTorch, scikit-learn, LangChain",
            question_type=QuestionType.TEXT,
            ai_context="Machine learning and AI frameworks if applicable.",
            required=False,
        ),
    ]


def _projects_questions(section: Section, constraints: TemplateInstruction) -> list[QuestionField]:
    return [
        QuestionField(
            id=f"{section.id}_project_name",
            label="Project Name",
            placeholder_hint="e.g. Resume Builder App",
            question_type=QuestionType.TEXT,
            ai_context="Name of the notable project.",
            required=True,
        ),
        QuestionField(
            id=f"{section.id}_tech_stack",
            label="Tech Stack Used",
            placeholder_hint="e.g. Next.js, FastAPI, PostgreSQL",
            question_type=QuestionType.TEXT,
            ai_context="Technologies used in this project.",
            required=False,
        ),
        QuestionField(
            id=f"{section.id}_project_desc",
            label="Project Description & Impact",
            placeholder_hint="What did you build? What was the outcome?",
            question_type=QuestionType.TEXTAREA,
            ai_context="Brief description of the project, your role, and its impact.",
            constraints=constraints,
            required=True,
        ),
        QuestionField(
            id=f"{section.id}_project_url",
            label="Project URL / GitHub Link (optional)",
            placeholder_hint="e.g. github.com/username/project",
            question_type=QuestionType.TEXT,
            ai_context="Link to the project repository or live demo.",
            required=False,
        ),
    ]


def _awards_questions(section: Section, constraints: TemplateInstruction) -> list[QuestionField]:
    return [
        QuestionField(
            id=f"{section.id}_certifications",
            label="Certifications",
            placeholder_hint="e.g. AWS Solutions Architect, Google Cloud Professional",
            question_type=QuestionType.TEXTAREA,
            ai_context="Professional certifications earned.",
            required=False,
        ),
        QuestionField(
            id=f"{section.id}_achievements",
            label="Awards & Achievements",
            placeholder_hint="e.g. Employee of the Year 2023, Hackathon Winner",
            question_type=QuestionType.TEXTAREA,
            ai_context="Notable awards, recognition, and achievements.",
            constraints=constraints,
            required=False,
        ),
    ]


def _generic_questions(section: Section, constraints: TemplateInstruction) -> list[QuestionField]:
    """Fallback for unknown section types."""
    return [
        QuestionField(
            id=f"{section.id}_content",
            label=f"{section.name} — Content",
            placeholder_hint=f"Enter your {section.name.lower()} details here",
            question_type=QuestionType.TEXTAREA,
            ai_context=f"Content for the {section.name} section of the resume.",
            constraints=constraints,
            required=False,
        ),
    ]


# ── Question type dispatch table ──────────────────────────────────────────────
QUESTION_BUILDERS = {
    "personal": _personal_questions,
    "summary": _summary_questions,
    "experience": _experience_questions,
    "education": _education_questions,
    "skills": _skills_questions,
    "projects": _projects_questions,
    "awards": _awards_questions,
    "volunteer": _generic_questions,
    "publications": _generic_questions,
    "references": _generic_questions,
    "generic": _generic_questions,
}


def generate_question_flow(parsed_template: ParsedTemplate) -> QuestionFlow:
    """
    Convert a ParsedTemplate into a complete QuestionFlow.
    Each section in the template becomes a QuestionCard with targeted fields.
    """
    cards: list[QuestionCard] = []

    for section in sorted(parsed_template.sections, key=lambda s: s.order):
        section_type = detect_section_type(section.name)
        constraints = get_section_constraints(section, parsed_template)

        # Build the questions for this section
        builder = QUESTION_BUILDERS.get(section_type, _generic_questions)
        fields = builder(section, constraints)

        # Link placeholder IDs where possible
        # (best-effort: match by label keywords)
        for ph in section.placeholders:
            for f in fields:
                if any(
                    word in f.label.lower()
                    for word in ph.label.lower().split()
                    if len(word) > 2
                ):
                    if f.linked_placeholder_id is None:
                        f.linked_placeholder_id = ph.id
                    break

        # Build description from template instructions
        desc_parts = []
        for inst in section.instructions:
            if inst.raw_text:
                desc_parts.append(f"📋 Template instruction: {inst.raw_text}")
        description = "\n".join(desc_parts)

        card = QuestionCard(
            section_id=section.id,
            section_name=section.name,
            section_order=section.order,
            fields=fields,
            description=description,
        )
        cards.append(card)

    return QuestionFlow(cards=cards, total_sections=len(cards))
