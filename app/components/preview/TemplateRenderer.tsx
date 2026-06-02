'use client';

/**
 * ResumePreview — Live formatted resume card rendered from answers.
 * Replaces the PDF/canvas renderer for the static question flow.
 */

import { useTemplateStore, parseArrayAnswer, parseLanguageAnswer } from '@/store/templateStore';

// ── Helpers ───────────────────────────────────────────────────────────────────
function val(answers: Record<string, any>, id: string): string {
  return answers[id]?.value?.trim() || '';
}

function arrVal(answers: Record<string, any>, id: string): string[] {
  const raw = answers[id]?.value || '';
  return parseArrayAnswer(raw).filter(Boolean);
}

function repeatInstances(
  answers: Record<string, any>,
  sectionId: string,
  count: number,
  fields: string[],
): Record<string, string>[] {
  const instances: Record<string, string>[] = [];
  for (let i = 0; i < count; i++) {
    const obj: Record<string, string> = {};
    for (const f of fields) {
      const key = i === 0 ? f : `${sectionId}_instance_${i}_${f}`;
      obj[f] = answers[key]?.value?.trim() || '';
    }
    instances.push(obj);
  }
  return instances.filter((inst) => Object.values(inst).some((v) => v));
}

// ── Section Heading ───────────────────────────────────────────────────────────
function SectionHeading({ title }: { title: string }) {
  return (
    <div style={{ marginBottom: '8px', marginTop: '16px' }}>
      <div style={{ fontSize: '11px', fontWeight: 700, color: '#1a1a1a', letterSpacing: '0.08em', textTransform: 'uppercase', borderBottom: '1.5px solid #333', paddingBottom: '3px' }}>
        {title}
      </div>
    </div>
  );
}

// ── Tag Pills ─────────────────────────────────────────────────────────────────
function TagRow({ tags }: { tags: string[] }) {
  if (!tags.length) return null;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '4px' }}>
      {tags.map((t) => (
        <span key={t} style={{ background: '#f0f0f0', border: '1px solid #ddd', borderRadius: '4px', padding: '1px 7px', fontSize: '10px', color: '#333' }}>
          {t}
        </span>
      ))}
    </div>
  );
}

export default function ResumePreview() {
  const { answers, repeatCounts } = useTemplateStore();

  // Personal Info
  const name = val(answers, 'pi_full_name');
  const email = val(answers, 'pi_email');
  const phone = val(answers, 'pi_phone');
  const location = val(answers, 'pi_location');
  const linkedin = val(answers, 'pi_linkedin');
  const github = val(answers, 'pi_github');

  // Executive Summary
  const role = val(answers, 'es_role');
  const suitability = val(answers, 'es_suitability');
  const experience = val(answers, 'es_experience');

  // Technical Skills
  const langs = arrVal(answers, 'ts_languages');
  const tools = arrVal(answers, 'ts_tools');
  const dbs = arrVal(answers, 'ts_databases');
  const aiml = arrVal(answers, 'ts_aiml');
  const other = arrVal(answers, 'ts_other');

  // Soft Skills & Languages
  const softSkills = arrVal(answers, 'ss_soft_skills');
  const langs2 = parseLanguageAnswer(answers['ss_languages']?.value || '');

  // Experience
  const expCount = repeatCounts['experience'] ?? 1;
  const exps = repeatInstances(answers, 'experience', expCount, ['exp_company', 'exp_role', 'exp_start', 'exp_end', 'exp_description', 'exp_achievements']);

  // Projects
  const projCount = repeatCounts['projects'] ?? 0;
  const projects = repeatInstances(answers, 'projects', projCount, ['proj_name', 'proj_tech', 'proj_description', 'proj_url']);

  // Education
  const eduCount = repeatCounts['education'] ?? 1;
  const edus = repeatInstances(answers, 'education', eduCount, ['edu_degree', 'edu_institution', 'edu_specialization', 'edu_year', 'edu_cgpa']);

  // Awards
  const awCount = repeatCounts['awards'] ?? 0;
  const awards = repeatInstances(answers, 'awards', awCount, ['aw_title', 'aw_org', 'aw_year', 'aw_description']);

  const hasAnyContent = name || email || role;

  if (!hasAnyContent) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '12px', color: 'rgba(255,255,255,0.2)' }}>
        <div style={{ fontSize: '48px' }}>📄</div>
        <p style={{ fontSize: '0.875rem' }}>Fill in your details to see the resume preview</p>
      </div>
    );
  }

  return (
    <div className="resume-preview-wrapper" style={{ height: '100%', overflowY: 'auto', background: '#f5f5f5', padding: '16px' }}>
      <div className="resume-print-target" style={{
        background: 'white',
        fontFamily: '"Calibri", "Arial", sans-serif',
        fontSize: '11px',
        color: '#1a1a1a',
        lineHeight: 1.45,
        padding: '28px 32px',
        maxWidth: '700px',
        margin: '0 auto',
        boxShadow: '0 2px 20px rgba(0,0,0,0.15)',
        minHeight: '900px',
      }}>

        {/* ── Header ───────────────────────────────────────────────────────── */}
        {(name || role) && (
          <div style={{ textAlign: 'center', marginBottom: '14px', paddingBottom: '10px', borderBottom: '2px solid #1a1a1a' }}>
            {name && (
              <div style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                {name}
              </div>
            )}
            {role && (
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#444', marginTop: '2px' }}>{role}</div>
            )}
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px', marginTop: '6px', fontSize: '10px', color: '#555' }}>
              {email && <span>✉ {email}</span>}
              {phone && <span>📞 {phone}</span>}
              {location && <span>📍 {location}</span>}
              {linkedin && <span>🔗 {linkedin.replace('https://', '')}</span>}
              {github && <span>💻 {github.replace('https://', '')}</span>}
            </div>
          </div>
        )}

        {/* ── Executive Summary ─────────────────────────────────────────────── */}
        {(suitability || experience) && (
          <>
            <SectionHeading title="Professional Summary" />
            <p style={{ marginBottom: '6px', color: '#333', textAlign: 'justify' }}>
              {suitability || experience}
            </p>
          </>
        )}

        {/* ── Technical Skills ──────────────────────────────────────────────── */}
        {(langs.length > 0 || tools.length > 0 || dbs.length > 0 || aiml.length > 0 || other.length > 0) && (
          <>
            <SectionHeading title="Technical Skills" />
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10.5px' }}>
              <tbody>
                {langs.length > 0 && (
                  <tr>
                    <td style={{ width: '130px', fontWeight: 600, verticalAlign: 'top', paddingBottom: '3px', color: '#333' }}>Languages:</td>
                    <td><TagRow tags={langs} /></td>
                  </tr>
                )}
                {tools.length > 0 && (
                  <tr>
                    <td style={{ fontWeight: 600, verticalAlign: 'top', paddingBottom: '3px', color: '#333' }}>Tools:</td>
                    <td><TagRow tags={tools} /></td>
                  </tr>
                )}
                {dbs.length > 0 && (
                  <tr>
                    <td style={{ fontWeight: 600, verticalAlign: 'top', paddingBottom: '3px', color: '#333' }}>Databases:</td>
                    <td><TagRow tags={dbs} /></td>
                  </tr>
                )}
                {aiml.length > 0 && (
                  <tr>
                    <td style={{ fontWeight: 600, verticalAlign: 'top', paddingBottom: '3px', color: '#333' }}>AI / ML:</td>
                    <td><TagRow tags={aiml} /></td>
                  </tr>
                )}
                {other.length > 0 && (
                  <tr>
                    <td style={{ fontWeight: 600, verticalAlign: 'top', paddingBottom: '3px', color: '#333' }}>Other:</td>
                    <td><TagRow tags={other} /></td>
                  </tr>
                )}
              </tbody>
            </table>
          </>
        )}

        {/* ── Experience ────────────────────────────────────────────────────── */}
        {exps.length > 0 && (
          <>
            <SectionHeading title="Professional Experience" />
            {exps.map((exp, i) => (
              <div key={i} style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div style={{ fontWeight: 700, fontSize: '11.5px' }}>{exp.exp_company || 'Company'}</div>
                  <div style={{ fontSize: '10px', color: '#666' }}>
                    {exp.exp_start}{exp.exp_end ? ` – ${exp.exp_end}` : ''}
                  </div>
                </div>
                {exp.exp_role && (
                  <div style={{ fontStyle: 'italic', color: '#444', fontSize: '11px', marginBottom: '4px' }}>{exp.exp_role}</div>
                )}
                {exp.exp_description && (
                  <ul style={{ margin: '0 0 0 16px', padding: 0 }}>
                    {exp.exp_description.split('\n').filter(Boolean).slice(0, 6).map((line: string, j: number) => (
                      <li key={j} style={{ marginBottom: '2px', color: '#333' }}>{line.replace(/^[-•*]\s*/, '')}</li>
                    ))}
                  </ul>
                )}
                {exp.exp_achievements && (
                  <div style={{ marginTop: '3px', color: '#444', fontSize: '10.5px' }}>
                    <strong>Achievement:</strong> {exp.exp_achievements.substring(0, 120)}{exp.exp_achievements.length > 120 ? '...' : ''}
                  </div>
                )}
              </div>
            ))}
          </>
        )}

        {/* ── Projects ──────────────────────────────────────────────────────── */}
        {projects.length > 0 && (
          <>
            <SectionHeading title="Projects" />
            {projects.map((proj, i) => {
              const techTags = proj.proj_tech ? parseArrayAnswer(proj.proj_tech) : [];
              return (
                <div key={i} style={{ marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <div style={{ fontWeight: 700, fontSize: '11.5px' }}>{proj.proj_name || 'Project'}</div>
                    {proj.proj_url && <div style={{ fontSize: '9px', color: '#666' }}>{proj.proj_url.replace('https://', '')}</div>}
                  </div>
                  {techTags.length > 0 && <TagRow tags={techTags} />}
                  {proj.proj_description && (
                    <p style={{ color: '#333', marginTop: '3px' }}>{proj.proj_description.substring(0, 200)}{proj.proj_description.length > 200 ? '...' : ''}</p>
                  )}
                </div>
              );
            })}
          </>
        )}

        {/* ── Education ─────────────────────────────────────────────────────── */}
        {edus.length > 0 && (
          <>
            <SectionHeading title="Education" />
            {edus.map((edu, i) => (
              <div key={i} style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{edu.edu_degree || 'Degree'}</div>
                  <div style={{ color: '#444' }}>{edu.edu_institution}</div>
                  {edu.edu_specialization && <div style={{ color: '#666', fontStyle: 'italic', fontSize: '10px' }}>{edu.edu_specialization}</div>}
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '12px' }}>
                  {edu.edu_year && <div style={{ color: '#444' }}>{edu.edu_year}</div>}
                  {edu.edu_cgpa && <div style={{ color: '#666', fontSize: '10px' }}>CGPA: {edu.edu_cgpa}</div>}
                </div>
              </div>
            ))}
          </>
        )}

        {/* ── Soft Skills & Languages ───────────────────────────────────────── */}
        {(softSkills.length > 0 || langs2.length > 0) && (
          <>
            <SectionHeading title="Skills & Languages" />
            {softSkills.length > 0 && (
              <div style={{ marginBottom: '6px' }}>
                <span style={{ fontWeight: 600, marginRight: '6px' }}>Soft Skills:</span>
                <TagRow tags={softSkills} />
              </div>
            )}
            {langs2.length > 0 && (
              <div>
                <span style={{ fontWeight: 600 }}>Languages: </span>
                {langs2.map((l, i) => (
                  <span key={i} style={{ marginRight: '10px' }}>
                    {l.language} <span style={{ color: '#666', fontSize: '10px' }}>({l.proficiency})</span>
                  </span>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── Awards ────────────────────────────────────────────────────────── */}
        {awards.length > 0 && (
          <>
            <SectionHeading title="Awards & Accomplishments" />
            {awards.map((aw, i) => (
              <div key={i} style={{ marginBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{aw.aw_title}</div>
                  <div style={{ color: '#444', fontSize: '10px' }}>{aw.aw_description}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '12px', fontSize: '10px', color: '#666' }}>
                  {aw.aw_org}<br />{aw.aw_year}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
