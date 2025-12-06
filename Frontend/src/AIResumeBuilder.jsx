import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, Download, Loader2 } from 'lucide-react';
import axios from 'axios';


const AIResumeBuilder = () => {
    const [loading, setLoading] = useState(false);
    const [generatedResume, setGeneratedResume] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        github: '',
        linkedin: '',
        jobTitle: '',
        company: '',
        jobDescription: '',
        experiences: [],
        projects: [],
        education: []
    });

    const addExperience = () => {
        setFormData({
            ...formData,
            experiences: [...formData.experiences, { title: '', company: '', duration: '', description: '' }]
        });
    };

    const removeExperience = (index) => {
        setFormData({
            ...formData,
            experiences: formData.experiences.filter((_, i) => i !== index)
        });
    };

    const updateExperience = (index, field, value) => {
        const updated = [...formData.experiences];
        updated[index][field] = value;
        setFormData({ ...formData, experiences: updated });
    };

    const addProject = () => {
        setFormData({
            ...formData,
            projects: [...formData.projects, { name: '', description: '', technologies: '' }]
        });
    };

    const removeProject = (index) => {
        setFormData({
            ...formData,
            projects: formData.projects.filter((_, i) => i !== index)
        });
    };

    const updateProject = (index, field, value) => {
        const updated = [...formData.projects];
        updated[index][field] = value;
        setFormData({ ...formData, projects: updated });
    };

    const addEducation = () => {
        setFormData({
            ...formData,
            education: [...formData.education, { degree: '', institution: '', year: '' }]
        });
    };

    const removeEducation = (index) => {
        setFormData({
            ...formData,
            education: formData.education.filter((_, i) => i !== index)
        });
    };

    const updateEducation = (index, field, value) => {
        const updated = [...formData.education];
        updated[index][field] = value;
        setFormData({ ...formData, education: updated });
    };

    const generateResume = async () => {
        setLoading(true);
        try {
            const prompt = `You are an expert ATS-friendly resume writer. Create a professional, stylish, keyword-optimized resume based on the following information. The resume MUST fit EXACTLY on 1 A4 page (297mm x 210mm).

Personal Information:
- Name: ${formData.name}
- Email: ${formData.email}
- GitHub: ${formData.github}
- LinkedIn: ${formData.linkedin}

Target Job:
- Job Title: ${formData.jobTitle}
- Company: ${formData.company}
- Job Description: ${formData.jobDescription}

Past Experience:
${formData.experiences.map((exp, i) => `${i + 1}. ${exp.title} at ${exp.company} (${exp.duration}): ${exp.description}`).join('\n')}

Projects:
${formData.projects.map((proj, i) => `${i + 1}. ${proj.name}: ${proj.description} (Tech: ${proj.technologies})`).join('\n')}

Education:
${formData.education.map((edu, i) => `${i + 1}. ${edu.degree} from ${edu.institution} (${edu.year})`).join('\n')}

CRITICAL INSTRUCTIONS:
1. The resume MUST fit on exactly 1 A4 page (max height: 1050px) - this is NON-NEGOTIABLE
2. Include ALL provided content - do NOT remove any experiences, projects, or education entries
3. If content exceeds one page, REDUCE FONT SIZES to make it fit:
   - Start with standard sizes: body 11px, headers 14px, name 24px
   - If too long, reduce to: body 10px, headers 12px, name 20px
   - If still too long, reduce to: body 9px, headers 11px, name 18px
   - Minimum readable size: body 8.5px, headers 10px, name 16px
4. Keep the resume professional and stylish:
   - Modern, clean design with professional color scheme (blues, grays)
   - Section headers with subtle background color (#f0f4f8) and bold text
   - Clear visual hierarchy and spacing
   - Professional fonts (Arial, Calibri, or Helvetica)
   - Elegant bullet points and dividers
5. Extract keywords from job description and incorporate naturally
6. Use strong action verbs and quantifiable achievements
7. Make it ATS-friendly with proper formatting
8. Structure:
   - Header: Name (large, bold), contact info (email, GitHub, LinkedIn)
   - Professional Summary: 2-4 impactful lines
   - Experience: All entries with bullet points
   - Projects: All entries with technologies
   - Education: All entries
   - Skills: Extracted from job description and experience
9. Styling guidelines:
   - Max-width: 750px, padding: 25px
   - Line-height: 1.4-1.5 for readability
   - Appropriate spacing between sections
   - Maintain professional appearance while fitting content

Return ONLY the HTML code with complete inline CSS styling that fits on ONE page while maintaining professional appearance, no explanations or markdown.`;

            const response = await axios.post(
                'http://localhost:5000/api/gemini/generate',
                { prompt }
            );

            let htmlContent = response.data.text || response.data;
            htmlContent = htmlContent.replace(/```html/g, '').replace(/```/g, '').trim();

            setGeneratedResume(htmlContent);
        } catch (error) {
            console.error('Error generating resume:', error);
            alert('Failed to generate resume. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const downloadPDF = async () => {
        const element = document.getElementById('resume-preview');
        const html2canvas = (await import('html2canvas')).default;
        const jsPDF = (await import('jspdf')).jsPDF;

        const canvas = await html2canvas(element, { scale: 2 });
        const imgData = canvas.toDataURL('image/jpeg', 0.98);
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${formData.name.replace(/\s+/g, '_')}_Resume.pdf`);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <Link to="/" className="flex items-center">
                            <span className="text-lg font-bold text-gray-800">Job Builder</span>
                        </Link>
                        <Link to="/" className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors">
                            Home
                        </Link>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16">
                <div className="mb-12 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        AI <span className="gradient-text">Resume Builder</span>
                    </h1>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Input Form */}
                    <div className="bg-white rounded-2xl shadow-lg p-8 h-fit border border-gray-100">
                        <h2 className="text-2xl font-bold mb-6">Your Information</h2>

                        {/* Personal Info */}
                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-sm font-semibold mb-2">Name *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="John Doe"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-2">Email *</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="john@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-2">GitHub</label>
                                <input
                                    type="text"
                                    value={formData.github}
                                    onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="github.com/johndoe"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-2">LinkedIn</label>
                                <input
                                    type="text"
                                    value={formData.linkedin}
                                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="linkedin.com/in/johndoe"
                                />
                            </div>
                        </div>

                        {/* Target Job */}
                        <div className="space-y-4 mb-6">
                            <h3 className="text-lg font-bold">Target Job</h3>
                            <div>
                                <label className="block text-sm font-semibold mb-2">Job Title *</label>
                                <input
                                    type="text"
                                    value={formData.jobTitle}
                                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="Software Engineer"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-2">Company *</label>
                                <input
                                    type="text"
                                    value={formData.company}
                                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="Google"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-2">Job Description *</label>
                                <textarea
                                    value={formData.jobDescription}
                                    onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 h-32"
                                    placeholder="Paste the job description here..."
                                />
                            </div>
                        </div>

                        {/* Experience */}
                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold">Experience (Optional)</h3>
                                <button
                                    onClick={addExperience}
                                    className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-all duration-300 shadow-md hover:shadow-lg"
                                >
                                    <Plus size={16} /> Add
                                </button>
                            </div>
                            {formData.experiences.map((exp, index) => (
                                <div key={index} className="border rounded-lg p-4 mb-4 relative">
                                    <button
                                        onClick={() => removeExperience(index)}
                                        className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                    <input
                                        type="text"
                                        value={exp.title}
                                        onChange={(e) => updateExperience(index, 'title', e.target.value)}
                                        className="w-full px-3 py-2 border rounded mb-2"
                                        placeholder="Job Title"
                                    />
                                    <input
                                        type="text"
                                        value={exp.company}
                                        onChange={(e) => updateExperience(index, 'company', e.target.value)}
                                        className="w-full px-3 py-2 border rounded mb-2"
                                        placeholder="Company"
                                    />
                                    <input
                                        type="text"
                                        value={exp.duration}
                                        onChange={(e) => updateExperience(index, 'duration', e.target.value)}
                                        className="w-full px-3 py-2 border rounded mb-2"
                                        placeholder="Duration (e.g., Jan 2020 - Dec 2022)"
                                    />
                                    <textarea
                                        value={exp.description}
                                        onChange={(e) => updateExperience(index, 'description', e.target.value)}
                                        className="w-full px-3 py-2 border rounded"
                                        placeholder="Describe your responsibilities and achievements"
                                        rows="3"
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Projects */}
                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold">Projects *</h3>
                                <button
                                    onClick={addProject}
                                    className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-all duration-300 shadow-md hover:shadow-lg"
                                >
                                    <Plus size={16} /> Add
                                </button>
                            </div>
                            {formData.projects.map((proj, index) => (
                                <div key={index} className="border rounded-lg p-4 mb-4 relative">
                                    <button
                                        onClick={() => removeProject(index)}
                                        className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                    <input
                                        type="text"
                                        value={proj.name}
                                        onChange={(e) => updateProject(index, 'name', e.target.value)}
                                        className="w-full px-3 py-2 border rounded mb-2"
                                        placeholder="Project Name"
                                    />
                                    <textarea
                                        value={proj.description}
                                        onChange={(e) => updateProject(index, 'description', e.target.value)}
                                        className="w-full px-3 py-2 border rounded mb-2"
                                        placeholder="Project description and your role"
                                        rows="2"
                                    />
                                    <input
                                        type="text"
                                        value={proj.technologies}
                                        onChange={(e) => updateProject(index, 'technologies', e.target.value)}
                                        className="w-full px-3 py-2 border rounded"
                                        placeholder="Technologies used (e.g., React, Node.js, MongoDB)"
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Education */}
                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold">Education (Optional)</h3>
                                <button
                                    onClick={addEducation}
                                    className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-all duration-300 shadow-md hover:shadow-lg"
                                >
                                    <Plus size={16} /> Add
                                </button>
                            </div>
                            {formData.education.map((edu, index) => (
                                <div key={index} className="border rounded-lg p-4 mb-4 relative">
                                    <button
                                        onClick={() => removeEducation(index)}
                                        className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                    <input
                                        type="text"
                                        value={edu.degree}
                                        onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                                        className="w-full px-3 py-2 border rounded mb-2"
                                        placeholder="Degree (e.g., B.Tech in Computer Science)"
                                    />
                                    <input
                                        type="text"
                                        value={edu.institution}
                                        onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                                        className="w-full px-3 py-2 border rounded mb-2"
                                        placeholder="Institution"
                                    />
                                    <input
                                        type="text"
                                        value={edu.year}
                                        onChange={(e) => updateEducation(index, 'year', e.target.value)}
                                        className="w-full px-3 py-2 border rounded"
                                        placeholder="Year (e.g., 2020 - 2024)"
                                    />
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={generateResume}
                            disabled={loading || !formData.name || !formData.email || !formData.jobTitle || !formData.jobDescription}
                            className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    Generating Resume...
                                </>
                            ) : (
                                'Generate AI Resume'
                            )}
                        </button>
                    </div>

                    {/* Preview */}
                    <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">Preview</h2>
                            {generatedResume && (
                                <button
                                    onClick={downloadPDF}
                                    className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-all duration-300 shadow-md hover:shadow-lg"
                                >
                                    <Download size={16} /> Download PDF
                                </button>
                            )}
                        </div>
                        <div className="border rounded-lg p-4 bg-gray-50 min-h-[600px] overflow-hidden">
                            {generatedResume ? (
                                <div
                                    id="resume-preview"
                                    dangerouslySetInnerHTML={{ __html: generatedResume }}
                                    className="bg-white overflow-auto max-h-[800px]"
                                    style={{ maxWidth: '100%', margin: '0 auto' }}
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-400">
                                    Fill the form and click "Generate AI Resume" to see preview
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIResumeBuilder;
