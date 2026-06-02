/**
 * staticQuestionFlow.ts
 * Hardcoded 7-section question flow for the resume builder.
 * This replaces the dynamic backend-driven question flow.
 */

import type { QuestionFlow, QuestionCard } from '@/store/templateStore';

export const STATIC_QUESTION_FLOW: QuestionFlow = {
  total_sections: 8,
  cards: [
    // ── 1. Personal Information ───────────────────────────────────────────────
    {
      section_id: 'personal_info',
      section_name: 'Personal Information',
      section_order: 1,
      description: 'Fill in your basic contact details. These appear at the top of your resume.',
      repeatable: false,
      fields: [
        {
          id: 'pi_full_name',
          label: 'Full Name',
          placeholder_hint: 'e.g. Arun Kumar Sharma',
          question_type: 'text',
          required: true,
          ai_context: 'Full name of the resume owner',
          constraints: {
            raw_text: 'Alphabets only, 3–50 characters',
            section: 'personal_info',
            min_chars: 3,
            max_chars: 50,
          },
        },
        {
          id: 'pi_email',
          label: 'Email Address',
          placeholder_hint: 'e.g. arun.sharma@gmail.com',
          question_type: 'email',
          required: true,
          ai_context: 'Professional email address',
          constraints: {
            raw_text: 'Valid email format, max 100 characters',
            section: 'personal_info',
            max_chars: 100,
          },
        },
        {
          id: 'pi_phone',
          label: 'Phone Number',
          placeholder_hint: 'e.g. 9876543210',
          question_type: 'phone',
          required: true,
          ai_context: 'Phone number with country code',
          constraints: {
            raw_text: '10–15 digits',
            section: 'personal_info',
            min_chars: 10,
            max_chars: 15,
          },
        },
        {
          id: 'pi_location',
          label: 'Location',
          placeholder_hint: 'e.g. Chennai, Tamil Nadu',
          question_type: 'text',
          required: true,
          ai_context: 'City and state of the resume owner',
          constraints: {
            raw_text: 'Max 50 characters',
            section: 'personal_info',
            max_chars: 50,
          },
        },
        {
          id: 'pi_linkedin',
          label: 'LinkedIn URL',
          placeholder_hint: 'e.g. https://linkedin.com/in/yourname',
          question_type: 'url',
          required: false,
          is_optional: true,
          ai_context: 'LinkedIn profile URL',
          constraints: {
            raw_text: 'Valid URL, max 200 characters',
            section: 'personal_info',
            max_chars: 200,
          },
        },
        {
          id: 'pi_github',
          label: 'GitHub / Portfolio URL',
          placeholder_hint: 'e.g. https://github.com/yourname',
          question_type: 'url',
          required: false,
          is_optional: true,
          ai_context: 'GitHub or portfolio website URL',
          constraints: {
            raw_text: 'Valid URL, max 200 characters',
            section: 'personal_info',
            max_chars: 200,
          },
        },
      ],
    },

    // ── 2. Executive Summary ──────────────────────────────────────────────────
    {
      section_id: 'executive_summary',
      section_name: 'Executive Summary',
      section_order: 2,
      description:
        'The AI will generate a 3–4 line professional summary (250–450 chars) based on your inputs below.',
      repeatable: false,
      fields: [
        {
          id: 'es_role',
          label: 'What role are you applying for?',
          placeholder_hint: 'e.g. Software Engineer, Data Analyst',
          question_type: 'text',
          required: true,
          ai_context: 'Target job role for the resume',
          constraints: {
            raw_text: 'Max 100 characters',
            section: 'executive_summary',
            max_chars: 100,
          },
        },
        {
          id: 'es_skills',
          label: 'What are your top technical skills?',
          placeholder_hint: 'Add 3–10 skills (press Enter or comma to add)',
          question_type: 'tags',
          required: true,
          ai_context: 'Top technical skills of the candidate',
          constraints: {
            raw_text: 'Min 3 skills, Max 10 skills',
            section: 'executive_summary',
            min_count: 3,
            max_count: 10,
          },
        },
        {
          id: 'es_experience',
          label: 'Do you have any internship / project experience?',
          placeholder_hint: 'Briefly describe your key experiences (50–500 chars)',
          question_type: 'textarea',
          required: true,
          ai_context: 'Internship or project experience overview',
          constraints: {
            raw_text: '50–500 characters',
            section: 'executive_summary',
            min_chars: 50,
            max_chars: 500,
          },
        },
        {
          id: 'es_suitability',
          label: 'Why are you suitable for this role?',
          placeholder_hint: 'Describe what makes you a great fit (100–400 chars)',
          question_type: 'textarea',
          required: true,
          ai_context: 'Candidate suitability for the target role',
          constraints: {
            raw_text: '100–400 characters',
            section: 'executive_summary',
            min_chars: 100,
            max_chars: 400,
          },
        },
      ],
    },

    // ── 3. Technical Skills ───────────────────────────────────────────────────
    {
      section_id: 'technical_skills',
      section_name: 'Technical Skills',
      section_order: 3,
      description:
        'Categorize your technical skills. At least one programming language is required.',
      repeatable: false,
      fields: [
        {
          id: 'ts_languages',
          label: 'Programming Languages',
          placeholder_hint: 'e.g. Python, Java, JavaScript (press Enter or comma)',
          question_type: 'tags',
          required: true,
          ai_context: 'Programming languages known by the candidate',
          constraints: {
            raw_text: 'Min 1, Max 20 tags',
            section: 'technical_skills',
            min_count: 1,
            max_count: 20,
          },
        },
        {
          id: 'ts_tools',
          label: 'Tools & Software',
          placeholder_hint: 'e.g. Git, Docker, VS Code, Figma',
          question_type: 'tags',
          required: true,
          ai_context: 'Development tools and software used',
          constraints: {
            raw_text: 'Min 1, Max 20 tags',
            section: 'technical_skills',
            min_count: 1,
            max_count: 20,
          },
        },
        {
          id: 'ts_databases',
          label: 'Databases',
          placeholder_hint: 'e.g. MySQL, PostgreSQL, MongoDB (optional)',
          question_type: 'tags',
          required: false,
          is_optional: true,
          ai_context: 'Database technologies used',
          constraints: {
            raw_text: 'Max 10 tags (optional)',
            section: 'technical_skills',
            max_count: 10,
          },
        },
        {
          id: 'ts_aiml',
          label: 'AI / ML Technologies',
          placeholder_hint: 'e.g. TensorFlow, PyTorch, scikit-learn (optional)',
          question_type: 'tags',
          required: false,
          is_optional: true,
          ai_context: 'AI and ML frameworks and technologies',
          constraints: {
            raw_text: 'Max 15 tags (optional)',
            section: 'technical_skills',
            max_count: 15,
          },
        },
        {
          id: 'ts_other',
          label: 'Other Technical Skills',
          placeholder_hint: 'e.g. REST APIs, CI/CD, Agile (optional)',
          question_type: 'tags',
          required: false,
          is_optional: true,
          ai_context: 'Other technical skills not covered above',
          constraints: {
            raw_text: 'Max 20 tags (optional)',
            section: 'technical_skills',
            max_count: 20,
          },
        },
      ],
    },

    // ── 4. Soft Skills & Languages ────────────────────────────────────────────
    {
      section_id: 'soft_skills',
      section_name: 'Soft Skills & Languages',
      section_order: 4,
      description:
        'Select the soft skills that best describe you and add the languages you speak.',
      repeatable: false,
      fields: [
        {
          id: 'ss_soft_skills',
          label: 'Select Soft Skills',
          placeholder_hint: 'Choose 3–10 soft skills',
          question_type: 'multiselect',
          required: true,
          ai_context: 'Soft skills of the candidate',
          options: [
            'Communication',
            'Teamwork',
            'Leadership',
            'Problem Solving',
            'Adaptability',
            'Critical Thinking',
            'Time Management',
            'Creativity',
            'Attention to Detail',
            'Conflict Resolution',
            'Emotional Intelligence',
            'Work Ethic',
            'Mentoring',
            'Decision Making',
            'Customer Focus',
            'Others',
          ],
          constraints: {
            raw_text: 'Min 3, Max 10 soft skills',
            section: 'soft_skills',
            min_count: 3,
            max_count: 10,
          },
        },
        {
          id: 'ss_languages',
          label: 'Languages Known',
          placeholder_hint: 'Add languages with proficiency level',
          question_type: 'language_block',
          required: true,
          ai_context: 'Languages known by the candidate with proficiency',
          options: ['Beginner', 'Intermediate', 'Advanced', 'Fluent', 'Native'],
          constraints: {
            raw_text: 'At least 1 language required',
            section: 'soft_skills',
            min_count: 1,
          },
        },
      ],
    },

    // ── 5. Professional Experience ────────────────────────────────────────────
    {
      section_id: 'experience',
      section_name: 'Professional Experience',
      section_order: 5,
      description:
        'Add your work experience. The AI will generate 5–10 responsibility bullets per role. Click "Add More Experience" to add multiple roles.',
      repeatable: true,
      repeat_label: 'Experience',
      repeat_min: 1,
      repeat_max: 10,
      fields: [
        {
          id: 'exp_company',
          label: 'Company / Organization Name',
          placeholder_hint: 'e.g. Infosys Ltd.',
          question_type: 'text',
          required: true,
          ai_context: 'Company or organization name',
          constraints: {
            raw_text: 'Max 100 characters',
            section: 'experience',
            max_chars: 100,
          },
        },
        {
          id: 'exp_role',
          label: 'Role / Designation',
          placeholder_hint: 'e.g. Software Engineer Intern',
          question_type: 'text',
          required: true,
          ai_context: 'Job title or designation',
          constraints: {
            raw_text: 'Max 50 characters',
            section: 'experience',
            max_chars: 50,
          },
        },
        {
          id: 'exp_start',
          label: 'Start Date',
          placeholder_hint: 'e.g. Jan 2023',
          question_type: 'month_year',
          required: true,
          ai_context: 'Start date of the role',
          constraints: {
            raw_text: 'Month and Year format',
            section: 'experience',
          },
        },
        {
          id: 'exp_end',
          label: 'End Date',
          placeholder_hint: 'e.g. Jun 2023 or Present',
          question_type: 'month_year',
          required: true,
          ai_context: 'End date of the role or Present',
          constraints: {
            raw_text: 'Month and Year format, or "Present"',
            section: 'experience',
          },
        },
        {
          id: 'exp_description',
          label: 'What did you do in this role?',
          placeholder_hint:
            'Describe your responsibilities in detail (min 200 chars). The AI will convert this into 5–10 bullet points.',
          question_type: 'textarea',
          required: true,
          ai_context: 'Role responsibilities and tasks performed',
          constraints: {
            raw_text: '200–2000 characters. AI generates 5–10 bullet points (80–150 chars each)',
            section: 'experience',
            min_chars: 200,
            max_chars: 2000,
            min_bullets: 5,
            max_bullets: 10,
          },
        },
        {
          id: 'exp_achievements',
          label: 'Key Achievements',
          placeholder_hint: 'What did you accomplish? Awards, recognitions, milestones (50–1000 chars)',
          question_type: 'textarea',
          required: false,
          is_optional: true,
          ai_context: 'Key achievements in this role',
          constraints: {
            raw_text: '50–1000 characters (optional)',
            section: 'experience',
            min_chars: 50,
            max_chars: 1000,
          },
        },
        {
          id: 'exp_impact',
          label: 'Impact & Metrics',
          placeholder_hint:
            'Projects completed? Team size? % improvement? Revenue? Users reached? (helps AI generate metrics)',
          question_type: 'textarea',
          required: false,
          is_optional: true,
          ai_context: 'Quantifiable impact and metrics from this role',
          constraints: {
            raw_text: 'Include numbers and metrics for best AI output (optional)',
            section: 'experience',
            max_chars: 800,
          },
        },
      ],
    },

    // ── 6. Projects ───────────────────────────────────────────────────────────
    {
      section_id: 'projects',
      section_name: 'Projects',
      section_order: 6,
      description:
        'Add your key projects. Click "Add More Project" to include multiple entries.',
      repeatable: true,
      repeat_label: 'Project',
      repeat_min: 0,
      repeat_max: 10,
      fields: [
        {
          id: 'proj_name',
          label: 'Project Name',
          placeholder_hint: 'e.g. AI Resume Builder',
          question_type: 'text',
          required: true,
          ai_context: 'Name of the project',
          constraints: {
            raw_text: 'Max 100 characters',
            section: 'projects',
            max_chars: 100,
          },
        },
        {
          id: 'proj_tech',
          label: 'Tech Stack Used',
          placeholder_hint: 'e.g. React, Node.js, MongoDB (press Enter or comma)',
          question_type: 'tags',
          required: false,
          is_optional: true,
          ai_context: 'Technologies used in this project',
          constraints: {
            raw_text: 'Max 15 tags (optional)',
            section: 'projects',
            max_count: 15,
          },
        },
        {
          id: 'proj_description',
          label: 'Project Description & Impact',
          placeholder_hint:
            'What did you build? What problem does it solve? What was the impact? (min 50 chars)',
          question_type: 'textarea',
          required: true,
          ai_context: 'Description and impact of the project',
          constraints: {
            raw_text: '50–1000 characters',
            section: 'projects',
            min_chars: 50,
            max_chars: 1000,
          },
        },
        {
          id: 'proj_url',
          label: 'Project URL / GitHub Link',
          placeholder_hint: 'e.g. https://github.com/yourname/project (optional)',
          question_type: 'url',
          required: false,
          is_optional: true,
          ai_context: 'URL or GitHub link for the project',
          constraints: {
            raw_text: 'Valid URL, max 200 characters (optional)',
            section: 'projects',
            max_chars: 200,
          },
        },
      ],
    },

    // ── 7. Education ──────────────────────────────────────────────────────────
    {
      section_id: 'education',
      section_name: 'Education',
      section_order: 7,
      description:
        'Add your educational qualifications. Click "Add More Education" for multiple degrees.',
      repeatable: true,
      repeat_label: 'Education',
      repeat_min: 1,
      repeat_max: 5,
      fields: [
        {
          id: 'edu_degree',
          label: 'Degree Name',
          placeholder_hint: 'e.g. B.Tech in Computer Science',
          question_type: 'text',
          required: true,
          ai_context: 'Degree or qualification name',
          constraints: {
            raw_text: 'Max 100 characters',
            section: 'education',
            max_chars: 100,
          },
        },
        {
          id: 'edu_institution',
          label: 'Institution Name',
          placeholder_hint: 'e.g. Anna University, Chennai',
          question_type: 'text',
          required: true,
          ai_context: 'Name of the educational institution',
          constraints: {
            raw_text: 'Max 150 characters',
            section: 'education',
            max_chars: 150,
          },
        },
        {
          id: 'edu_specialization',
          label: 'Specialization',
          placeholder_hint: 'e.g. Artificial Intelligence (optional)',
          question_type: 'text',
          required: false,
          is_optional: true,
          ai_context: 'Major or specialization field',
          constraints: {
            raw_text: 'Optional',
            section: 'education',
            max_chars: 100,
          },
        },
        {
          id: 'edu_year',
          label: 'Graduation Year',
          placeholder_hint: 'e.g. 2024',
          question_type: 'year',
          required: true,
          ai_context: 'Year of graduation or expected graduation',
          constraints: {
            raw_text: '4-digit year',
            section: 'education',
          },
        },
        {
          id: 'edu_cgpa',
          label: 'CGPA / Percentage',
          placeholder_hint: 'e.g. 8.5 or 85% (optional)',
          question_type: 'decimal',
          required: false,
          is_optional: true,
          ai_context: 'Academic score — CGPA or percentage',
          constraints: {
            raw_text: 'Decimal number (optional)',
            section: 'education',
          },
        },
      ],
    },

    // ── 8. Awards & Accomplishments ───────────────────────────────────────────
    {
      section_id: 'awards',
      section_name: 'Awards & Accomplishments',
      section_order: 8,
      description:
        'Add your awards, certifications, and achievements. Click "Add More Achievement" to include multiple entries.',
      repeatable: true,
      repeat_label: 'Achievement',
      repeat_min: 0,
      repeat_max: 10,
      fields: [
        {
          id: 'aw_title',
          label: 'Achievement Title',
          placeholder_hint: 'e.g. First Place — National Hackathon 2023',
          question_type: 'text',
          required: true,
          ai_context: 'Title of the award or achievement',
          constraints: {
            raw_text: 'Max 120 characters',
            section: 'awards',
            max_chars: 120,
          },
        },
        {
          id: 'aw_org',
          label: 'Organization',
          placeholder_hint: 'e.g. IIT Madras, Google, NASSCOM',
          question_type: 'text',
          required: true,
          ai_context: 'Organization that gave the award',
          constraints: {
            raw_text: 'Max 100 characters',
            section: 'awards',
            max_chars: 100,
          },
        },
        {
          id: 'aw_year',
          label: 'Year',
          placeholder_hint: 'e.g. 2023',
          question_type: 'year',
          required: true,
          ai_context: 'Year the award was received',
          constraints: {
            raw_text: '4-digit year',
            section: 'awards',
          },
        },
        {
          id: 'aw_description',
          label: 'Description',
          placeholder_hint: 'Briefly describe the achievement (20–300 chars)',
          question_type: 'textarea',
          required: true,
          ai_context: 'Description of the award or achievement',
          constraints: {
            raw_text: '20–300 characters',
            section: 'awards',
            min_chars: 20,
            max_chars: 300,
          },
        },
      ],
    },
  ],
};

/** Minimal parsed template stub so the store is satisfied */
export const STATIC_PARSED_TEMPLATE = {
  file_type: 'docx' as const,
  original_filename: 'resume_template.docx',
  page_count: 1,
  sections: [],
  all_instructions: [],
  all_placeholders: [],
  default_font: { name: 'Calibri', size: 11, bold: false, italic: false },
};

export const STATIC_SUMMARY = {
  sections_found: 8,
  placeholders_found: 0,
  instructions_found: 0,
  question_cards: 8,
};
