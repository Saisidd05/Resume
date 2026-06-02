"""
Default Question Flow — hardcoded 7-section question set for the bundled template.

This bypasses the dynamic question_engine.py and returns a fixed, well-structured
question flow based on the user-specified requirements for the bundled PDF template.

Sections:
  1. Personal Information
  2. Executive Summary
  3. Technical Skills
  4. Soft Skills
  5. Professional Experience (repeatable)
  6. Education (repeatable)
  7. Awards & Accomplishments (repeatable)
"""
from __future__ import annotations

from backend.models.schemas import (
    QuestionCard, QuestionField, QuestionFlow,
    QuestionType, TemplateInstruction,
)


# ── Soft Skill Options ────────────────────────────────────────────────────────
SOFT_SKILL_OPTIONS = [
    "Communication", "Teamwork", "Leadership", "Problem Solving",
    "Adaptability", "Critical Thinking", "Time Management",
    "Creativity", "Attention to Detail", "Emotional Intelligence",
    "Conflict Resolution", "Decision Making", "Multitasking",
    "Self-Motivation", "Work Ethic",
]

PROFICIENCY_OPTIONS = ["Beginner", "Intermediate", "Advanced", "Fluent", "Native"]


def _c(section: str, **kwargs) -> TemplateInstruction:
    """Shorthand for creating a TemplateInstruction constraint."""
    return TemplateInstruction(raw_text="", section=section, **kwargs)


def build_default_question_flow() -> QuestionFlow:
    """
    Returns the fixed question flow for the bundled resume template.
    """
    cards: list[QuestionCard] = []

    # ── 1. Personal Information ───────────────────────────────────────────────
    cards.append(QuestionCard(
        section_id="personal",
        section_name="Personal Information",
        section_order=0,
        description="Your basic contact details that appear at the top of the resume.",
        repeatable=False,
        fields=[
            QuestionField(
                id="personal_full_name",
                label="Full Name",
                placeholder_hint="e.g. Priya Sharma",
                question_type=QuestionType.TEXT,
                required=True,
                ai_context="Candidate's full name for the resume header.",
                constraints=_c("Personal", min_chars=3, max_chars=50,
                               custom_note="Alphabets only, 3–50 characters"),
            ),
            QuestionField(
                id="personal_email",
                label="Email Address",
                placeholder_hint="e.g. priya@example.com",
                question_type=QuestionType.EMAIL,
                required=True,
                ai_context="Professional email address.",
                constraints=_c("Personal", max_chars=100,
                               custom_note="Valid email format, max 100 characters"),
            ),
            QuestionField(
                id="personal_phone",
                label="Phone Number",
                placeholder_hint="e.g. +91 98765 43210",
                question_type=QuestionType.PHONE,
                required=True,
                ai_context="Phone number with country code.",
                constraints=_c("Personal", min_chars=10, max_chars=15,
                               custom_note="10–15 digits"),
            ),
            QuestionField(
                id="personal_location",
                label="Location",
                placeholder_hint="e.g. Chennai, Tamil Nadu",
                question_type=QuestionType.TEXT,
                required=False,
                is_optional=True,
                ai_context="City and state/country of residence.",
                constraints=_c("Personal", max_chars=50,
                               custom_note="City, State format"),
            ),
            QuestionField(
                id="personal_linkedin",
                label="LinkedIn URL",
                placeholder_hint="e.g. linkedin.com/in/priyasharma",
                question_type=QuestionType.URL,
                required=False,
                is_optional=True,
                ai_context="LinkedIn profile URL.",
                constraints=_c("Personal", max_chars=200),
            ),
            QuestionField(
                id="personal_github",
                label="GitHub / Portfolio URL",
                placeholder_hint="e.g. github.com/priyasharma",
                question_type=QuestionType.URL,
                required=False,
                is_optional=True,
                ai_context="GitHub or portfolio URL.",
                constraints=_c("Personal", max_chars=200),
            ),
        ],
    ))

    # ── 2. Executive Summary ──────────────────────────────────────────────────
    cards.append(QuestionCard(
        section_id="summary",
        section_name="Executive Summary",
        section_order=1,
        description="Template requires a 3–4 line professional summary. Answer the questions below and we'll craft it for you.",
        repeatable=False,
        fields=[
            QuestionField(
                id="summary_role",
                label="What role are you applying for?",
                placeholder_hint="e.g. Full Stack Developer at a product startup",
                question_type=QuestionType.TEXT,
                required=True,
                ai_context="The job role the candidate is targeting.",
                constraints=_c("Executive Summary", max_chars=100),
            ),
            QuestionField(
                id="summary_skills",
                label="What are your top technical skills?",
                placeholder_hint="e.g. React, Node.js, Python, AWS (add at least 3)",
                question_type=QuestionType.TAGS,
                required=True,
                ai_context="Core technical skills to highlight in the summary.",
                constraints=_c("Executive Summary", min_count=3, max_count=10,
                               custom_note="Add 3–10 skills"),
            ),
            QuestionField(
                id="summary_experience",
                label="Describe your internship / project experience",
                placeholder_hint="Briefly describe your most relevant experience or projects...",
                question_type=QuestionType.TEXTAREA,
                required=True,
                ai_context="Internship or project experience for the summary section.",
                constraints=_c("Executive Summary", min_chars=50, max_chars=500,
                               custom_note="50–500 characters"),
            ),
            QuestionField(
                id="summary_why_suitable",
                label="Why are you suitable for this role?",
                placeholder_hint="Describe what makes you the right fit — your strengths, unique value...",
                question_type=QuestionType.TEXTAREA,
                required=True,
                ai_context="Why the candidate is suitable for the target role.",
                constraints=_c("Executive Summary", min_chars=100, max_chars=400,
                               custom_note="100–400 characters"),
            ),
        ],
    ))

    # ── 3. Technical Skills ───────────────────────────────────────────────────
    cards.append(QuestionCard(
        section_id="technical_skills",
        section_name="Technical Skills",
        section_order=2,
        description="Template requires categorised skills. Add them as tags below.",
        repeatable=False,
        fields=[
            QuestionField(
                id="skills_languages",
                label="Programming Languages",
                placeholder_hint="e.g. Python, TypeScript, Java, C++ (type and press Enter)",
                question_type=QuestionType.TAGS,
                required=True,
                ai_context="Programming languages the candidate is proficient in.",
                constraints=_c("Technical Skills", min_count=1, max_count=20),
            ),
            QuestionField(
                id="skills_tools",
                label="Tools & Software",
                placeholder_hint="e.g. Docker, Git, VS Code, Postman",
                question_type=QuestionType.TAGS,
                required=True,
                ai_context="Development tools and software used.",
                constraints=_c("Technical Skills", min_count=1, max_count=20),
            ),
            QuestionField(
                id="skills_databases",
                label="Databases",
                placeholder_hint="e.g. PostgreSQL, MongoDB, Redis",
                question_type=QuestionType.TAGS,
                required=False,
                is_optional=True,
                ai_context="Databases and data stores the candidate works with.",
                constraints=_c("Technical Skills", max_count=10),
            ),
            QuestionField(
                id="skills_aiml",
                label="AI / ML Technologies",
                placeholder_hint="e.g. TensorFlow, PyTorch, scikit-learn, LangChain",
                question_type=QuestionType.TAGS,
                required=False,
                is_optional=True,
                ai_context="AI and machine learning frameworks if applicable.",
                constraints=_c("Technical Skills", max_count=15),
            ),
            QuestionField(
                id="skills_other",
                label="Other Technical Skills",
                placeholder_hint="e.g. REST APIs, GraphQL, Agile, CI/CD",
                question_type=QuestionType.TAGS,
                required=False,
                is_optional=True,
                ai_context="Any other technical skills not listed above.",
                constraints=_c("Technical Skills", max_count=20),
            ),
        ],
    ))

    # ── 4. Soft Skills ────────────────────────────────────────────────────────
    cards.append(QuestionCard(
        section_id="soft_skills",
        section_name="Soft Skills",
        section_order=3,
        description="Select employer-valued soft skills and add languages you know.",
        repeatable=False,
        fields=[
            QuestionField(
                id="soft_skills_select",
                label="Select Soft Skills",
                placeholder_hint="Choose 3–10 soft skills",
                question_type=QuestionType.MULTISELECT,
                required=True,
                ai_context="Soft skills for the resume.",
                options=SOFT_SKILL_OPTIONS,
                constraints=_c("Soft Skills", min_count=3, max_count=10,
                               custom_note="Select 3–10 soft skills"),
            ),
            QuestionField(
                id="soft_skills_languages",
                label="Languages Known",
                placeholder_hint="Add language and select proficiency level",
                question_type=QuestionType.LANGUAGE_BLOCK,
                required=False,
                is_optional=True,
                ai_context="Languages spoken and proficiency levels.",
                options=PROFICIENCY_OPTIONS,
            ),
        ],
    ))

    # ── 5. Professional Experience (repeatable) ───────────────────────────────
    cards.append(QuestionCard(
        section_id="experience",
        section_name="Professional Experience",
        section_order=4,
        description="Template requires 5–10 responsibility bullets and measurable impact. Add each role separately.",
        repeatable=True,
        repeat_label="Add Another Experience",
        repeat_min=1,
        repeat_max=10,
        fields=[
            QuestionField(
                id="exp_company",
                label="Company / Organization Name",
                placeholder_hint="e.g. Google India Pvt. Ltd.",
                question_type=QuestionType.TEXT,
                required=True,
                ai_context="Employer or company name.",
                constraints=_c("Experience", max_chars=100),
            ),
            QuestionField(
                id="exp_role",
                label="Role / Designation",
                placeholder_hint="e.g. Software Engineer II / Intern",
                question_type=QuestionType.TEXT,
                required=True,
                ai_context="Job title held at this company.",
                constraints=_c("Experience", max_chars=50),
            ),
            QuestionField(
                id="exp_start",
                label="Start Date",
                placeholder_hint="e.g. Jan 2022",
                question_type=QuestionType.MONTH_YEAR,
                required=True,
                ai_context="Employment start date.",
            ),
            QuestionField(
                id="exp_end",
                label="End Date",
                placeholder_hint="e.g. Dec 2023 or Present",
                question_type=QuestionType.MONTH_YEAR,
                required=True,
                ai_context="Employment end date or 'Present'.",
            ),
            QuestionField(
                id="exp_responsibilities",
                label="What did you do in this role?",
                placeholder_hint="Describe your key responsibilities and day-to-day tasks...",
                question_type=QuestionType.TEXTAREA,
                required=True,
                ai_context="Generate 5–10 bullet points for responsibilities in this role. Each bullet 80–150 chars.",
                constraints=_c("Experience",
                               min_chars=200, max_chars=2000,
                               min_bullets=5, max_bullets=10,
                               custom_note="Describe your role — AI will generate 5–10 bullet points"),
            ),
            QuestionField(
                id="exp_achievements",
                label="Key Achievements",
                placeholder_hint="What results did you achieve? e.g. Reduced load time by 40%...",
                question_type=QuestionType.TEXTAREA,
                required=False,
                is_optional=True,
                ai_context="Key measurable achievements in this role.",
                constraints=_c("Experience", min_chars=50, max_chars=1000),
            ),
            QuestionField(
                id="exp_impact",
                label="Impact Metrics",
                placeholder_hint="Projects completed, team size, % improvement, revenue, users...",
                question_type=QuestionType.TEXTAREA,
                required=False,
                is_optional=True,
                ai_context="Quantifiable impact: projects completed, team size, improvements, revenue, users reached. Generate 2–5 impact bullets with metrics.",
                constraints=_c("Experience", max_chars=500,
                               custom_note="Include: # projects, team size, % improvement, revenue, users"),
            ),
        ],
    ))

    # ── 6. Education (repeatable) ─────────────────────────────────────────────
    cards.append(QuestionCard(
        section_id="education",
        section_name="Education",
        section_order=5,
        description="Add your educational qualifications. Click 'Add Another Education' for multiple degrees.",
        repeatable=True,
        repeat_label="Add Another Education",
        repeat_min=1,
        repeat_max=5,
        fields=[
            QuestionField(
                id="edu_degree",
                label="Degree Name",
                placeholder_hint="e.g. B.Tech in Computer Science",
                question_type=QuestionType.TEXT,
                required=True,
                ai_context="Degree name and field of study.",
                constraints=_c("Education", max_chars=100),
            ),
            QuestionField(
                id="edu_institution",
                label="Institution Name",
                placeholder_hint="e.g. IIT Bombay",
                question_type=QuestionType.TEXT,
                required=True,
                ai_context="College or university name.",
                constraints=_c("Education", max_chars=150),
            ),
            QuestionField(
                id="edu_specialization",
                label="Specialization",
                placeholder_hint="e.g. Artificial Intelligence (optional)",
                question_type=QuestionType.TEXT,
                required=False,
                is_optional=True,
                ai_context="Field of specialization if applicable.",
            ),
            QuestionField(
                id="edu_year",
                label="Graduation Year",
                placeholder_hint="e.g. 2024",
                question_type=QuestionType.YEAR,
                required=True,
                ai_context="Year of graduation or expected graduation.",
            ),
            QuestionField(
                id="edu_cgpa",
                label="CGPA / Percentage",
                placeholder_hint="e.g. 8.5 / 10 or 85% (optional)",
                question_type=QuestionType.DECIMAL,
                required=False,
                is_optional=True,
                ai_context="Academic performance indicator.",
            ),
        ],
    ))

    # ── 7. Awards & Accomplishments (repeatable) ──────────────────────────────
    cards.append(QuestionCard(
        section_id="awards",
        section_name="Awards & Accomplishments",
        section_order=6,
        description="Template requests awards, certifications and achievements. Add each one separately.",
        repeatable=True,
        repeat_label="Add Another Achievement",
        repeat_min=0,
        repeat_max=10,
        fields=[
            QuestionField(
                id="award_title",
                label="Achievement Title",
                placeholder_hint="e.g. AWS Solutions Architect – Associate",
                question_type=QuestionType.TEXT,
                required=True,
                ai_context="Award, certification or achievement title.",
                constraints=_c("Awards", max_chars=120),
            ),
            QuestionField(
                id="award_org",
                label="Issuing Organization",
                placeholder_hint="e.g. Amazon Web Services",
                question_type=QuestionType.TEXT,
                required=True,
                ai_context="Organization that issued the award or certification.",
                constraints=_c("Awards", max_chars=100),
            ),
            QuestionField(
                id="award_year",
                label="Year",
                placeholder_hint="e.g. 2023",
                question_type=QuestionType.YEAR,
                required=True,
                ai_context="Year the award or certification was received.",
            ),
            QuestionField(
                id="award_description",
                label="Description",
                placeholder_hint="Briefly describe the achievement or what the certification validates...",
                question_type=QuestionType.TEXTAREA,
                required=False,
                is_optional=True,
                ai_context="Brief description of the award or certification.",
                constraints=_c("Awards", min_chars=20, max_chars=300),
            ),
        ],
    ))

    return QuestionFlow(cards=cards, total_sections=len(cards))
