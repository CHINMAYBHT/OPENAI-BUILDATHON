import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, Download, Loader2 } from 'lucide-react';
import axios from 'axios';


const AIResumeBuilder = () => {
    const [loading, setLoading] = useState(false);
    const [generatedResume, setGeneratedResume] = useState(null);
    const [currentStep, setCurrentStep] = useState(1);

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

            const apiBase = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
            const response = await axios.post(
                `${apiBase}/api/gemini/generate`,
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
            {/* Navigation - Only show home button when NOT in preview mode */}
            {!generatedResume && (
                <Link
                    to="/"
                    className="fixed top-6 right-6 z-50 p-3 rounded-lg bg-white hover:bg-gray-50 transition-all duration-300 text-blue-500 hover:text-blue-600 shadow-lg"
                    title="Go to Home"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                </Link>
            )}

            {!generatedResume ? (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
                    <div className="mb-12 text-center">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            AI <span className="gradient-text">Resume Builder</span>
                        </h1>
                    </div>

                    {/* Stepper - Outside Container */}
                    {!generatedResume && (
                        <div className="mb-8 max-w-4xl mx-auto">
                            <div className="flex items-center justify-between max-w-2xl mx-auto">
                                <div className="flex flex-col items-center flex-1">
                                    <div className={`w-14 h-14 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'} transition-all`}>
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                    </div>
                                    <span className={`text-xs mt-2 font-medium ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-500'}`}>Personal Info</span>
                                </div>
                                <div className={`flex-1 h-1 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                                <div className="flex flex-col items-center flex-1">
                                    <div className={`w-14 h-14 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'} transition-all`}>
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                    </div>
                                    <span className={`text-xs mt-2 font-medium ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-500'}`}>Application Details</span>
                                </div>
                                <div className={`flex-1 h-1 ${currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                                <div className="flex flex-col items-center flex-1">
                                    <div className={`w-14 h-14 rounded-full flex items-center justify-center ${currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'} transition-all`}>
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                    </div>
                                    <span className={`text-xs mt-2 font-medium ${currentStep >= 3 ? 'text-blue-600' : 'text-gray-500'}`}>Documents</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="max-w-4xl mx-auto">
                        {/* Input Form */}
                        <div className="bg-white rounded-xl shadow-lg p-8 h-fit border border-gray-200">

                            {/* Step 1: Personal Info */}
                            {currentStep === 1 && (
                                <div className="space-y-6 animate-fadeIn">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
                                            <p className="text-sm text-gray-500">Your personal details for the resume</p>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">Name *</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">Email *</label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">GitHub</label>
                                        <input
                                            type="text"
                                            value={formData.github}
                                            onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                            placeholder="github.com/johndoe"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">LinkedIn</label>
                                        <input
                                            type="text"
                                            value={formData.linkedin}
                                            onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                            placeholder="linkedin.com/in/johndoe"
                                        />
                                    </div>

                                    {/* Navigation Buttons */}
                                    <div className="flex justify-between items-center pt-4">
                                        <Link
                                            to="/"
                                            className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-all inline-block"
                                        >
                                            Cancel
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={() => setCurrentStep(2)}
                                            disabled={!formData.name || !formData.email}
                                            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                                        >
                                            Continue
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Target Job */}
                            {currentStep === 2 && (
                                <div className="space-y-6 animate-fadeIn">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-900">Target Job</h2>
                                            <p className="text-sm text-gray-500">Details about the job you're applying for</p>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">Job Title *</label>
                                        <input
                                            type="text"
                                            value={formData.jobTitle}
                                            onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                            placeholder="Software Engineer"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">Company *</label>
                                        <input
                                            type="text"
                                            value={formData.company}
                                            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                            placeholder="Google"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">Job Description *</label>
                                        <textarea
                                            value={formData.jobDescription}
                                            onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all h-32"
                                            placeholder="Paste the job description here..."
                                        />
                                    </div>

                                    {/* Navigation Buttons */}
                                    <div className="flex justify-between items-center pt-4">
                                        <button
                                            type="button"
                                            onClick={() => setCurrentStep(1)}
                                            className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-all flex items-center gap-2"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                            Back
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setCurrentStep(3)}
                                            disabled={!formData.jobTitle || !formData.company || !formData.jobDescription}
                                            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                                        >
                                            Continue
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Experience, Projects, Education */}
                            {currentStep === 3 && (
                                <div className="space-y-6 animate-fadeIn">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-900">Documents</h2>
                                            <p className="text-sm text-gray-500">Add your experience, projects, and education</p>
                                        </div>
                                    </div>

                                    {/* Experience Section */}
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-bold">Experience (Optional)</h3>
                                        <button
                                            onClick={addExperience}
                                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg text-sm font-semibold"
                                        >
                                            <Plus size={16} /> Add
                                        </button>
                                    </div>
                                    {formData.experiences.length === 0 && (
                                        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                                            <p className="text-gray-500 text-sm">No experience added yet. Click "Add" to include your work experience.</p>
                                        </div>
                                    )}
                                    {formData.experiences.map((exp, index) => (
                                        <div key={index} className="border-2 border-gray-200 rounded-xl p-5 mb-4 relative bg-white hover:border-blue-300 transition-all">
                                            <div className="absolute top-3 right-3 flex gap-2">
                                                <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-1 rounded">#{index + 1}</span>
                                                <button
                                                    onClick={() => removeExperience(index)}
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-all"
                                                    title="Remove experience"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                            <div className="space-y-3 mt-2">
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Job Title</label>
                                                    <input
                                                        type="text"
                                                        value={exp.title}
                                                        onChange={(e) => updateExperience(index, 'title', e.target.value)}
                                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                                                        placeholder="e.g., Software Engineer"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="block text-xs font-semibold text-gray-700 mb-1">Company</label>
                                                        <input
                                                            type="text"
                                                            value={exp.company}
                                                            onChange={(e) => updateExperience(index, 'company', e.target.value)}
                                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                                                            placeholder="e.g., Google"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-semibold text-gray-700 mb-1">Duration</label>
                                                        <input
                                                            type="text"
                                                            value={exp.duration}
                                                            onChange={(e) => updateExperience(index, 'duration', e.target.value)}
                                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                                                            placeholder="Jan 2020 - Dec 2022"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
                                                    <textarea
                                                        value={exp.description}
                                                        onChange={(e) => updateExperience(index, 'description', e.target.value)}
                                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                                                        placeholder="Describe your key responsibilities and achievements..."
                                                        rows="3"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Projects Section */}
                                    <div className="flex justify-between items-center mb-4 mt-6">
                                        <h3 className="text-lg font-bold">Projects *</h3>
                                        <button
                                            onClick={addProject}
                                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg text-sm font-semibold"
                                        >
                                            <Plus size={16} /> Add
                                        </button>
                                    </div>
                                    {formData.projects.length === 0 && (
                                        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                                            <p className="text-gray-500 text-sm">No projects added yet. Click "Add" to showcase your projects.</p>
                                        </div>
                                    )}
                                    {formData.projects.map((proj, index) => (
                                        <div key={index} className="border-2 border-gray-200 rounded-xl p-5 mb-4 relative bg-white hover:border-blue-300 transition-all">
                                            <div className="absolute top-3 right-3 flex gap-2">
                                                <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-1 rounded">#{index + 1}</span>
                                                <button
                                                    onClick={() => removeProject(index)}
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-all"
                                                    title="Remove project"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                            <div className="space-y-3 mt-2">
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Project Name</label>
                                                    <input
                                                        type="text"
                                                        value={proj.name}
                                                        onChange={(e) => updateProject(index, 'name', e.target.value)}
                                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                                                        placeholder="e.g., E-commerce Platform"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
                                                    <textarea
                                                        value={proj.description}
                                                        onChange={(e) => updateProject(index, 'description', e.target.value)}
                                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                                                        placeholder="Describe the project and your role in it..."
                                                        rows="3"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Technologies Used</label>
                                                    <input
                                                        type="text"
                                                        value={proj.technologies}
                                                        onChange={(e) => updateProject(index, 'technologies', e.target.value)}
                                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                                                        placeholder="e.g., React, Node.js, MongoDB, AWS"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Education Section */}
                                    <div className="flex justify-between items-center mb-4 mt-6">
                                        <h3 className="text-lg font-bold">Education (Optional)</h3>
                                        <button
                                            onClick={addEducation}
                                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg text-sm font-semibold"
                                        >
                                            <Plus size={16} /> Add
                                        </button>
                                    </div>
                                    {formData.education.length === 0 && (
                                        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                                            <p className="text-gray-500 text-sm">No education added yet. Click "Add" to include your educational background.</p>
                                        </div>
                                    )}
                                    {formData.education.map((edu, index) => (
                                        <div key={index} className="border-2 border-gray-200 rounded-xl p-5 mb-4 relative bg-white hover:border-blue-300 transition-all">
                                            <div className="absolute top-3 right-3 flex gap-2">
                                                <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-1 rounded">#{index + 1}</span>
                                                <button
                                                    onClick={() => removeEducation(index)}
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-all"
                                                    title="Remove education"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                            <div className="space-y-3 mt-2">
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Degree / Qualification</label>
                                                    <input
                                                        type="text"
                                                        value={edu.degree}
                                                        onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                                                        placeholder="e.g., B.Tech in Computer Science"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="block text-xs font-semibold text-gray-700 mb-1">Institution</label>
                                                        <input
                                                            type="text"
                                                            value={edu.institution}
                                                            onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                                                            placeholder="e.g., MIT"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-semibold text-gray-700 mb-1">Year / Duration</label>
                                                        <input
                                                            type="text"
                                                            value={edu.year}
                                                            onChange={(e) => updateEducation(index, 'year', e.target.value)}
                                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                                                            placeholder="2020 - 2024"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Navigation Buttons */}
                                    <div className="flex justify-between items-center pt-4">
                                        <button
                                            type="button"
                                            onClick={() => setCurrentStep(2)}
                                            className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-all flex items-center gap-2"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                            Back
                                        </button>
                                        <button
                                            type="button"
                                            onClick={generateResume}
                                            disabled={loading || !formData.name || !formData.email || !formData.jobTitle || !formData.jobDescription}
                                            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 className="animate-spin" size={20} />
                                                    Generating...
                                                </>
                                            ) : (
                                                <>
                                                    Generate Resume
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                /* Full Page Preview */
                <>
                    {/* Home Button for Preview Mode */}
                    <Link
                        to="/"
                        className="fixed top-6 right-6 z-50 p-3 rounded-lg bg-white hover:bg-gray-50 transition-all duration-300 text-blue-500 hover:text-blue-600 shadow-lg"
                        title="Go to Home"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                    </Link>

                    <div className="min-h-screen bg-gray-100">
                        {/* Preview Header with Download Button */}
                        <div className="bg-white shadow-md sticky top-0 z-40 border-b border-gray-200">
                            <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => setGeneratedResume(null)}
                                        className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                        Edit Resume
                                    </button>
                                    <h2 className="text-2xl font-bold text-gray-800">Resume Preview</h2>
                                </div>
                                <button
                                    onClick={downloadPDF}
                                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg font-semibold"
                                >
                                    <Download size={20} /> Download PDF
                                </button>
                            </div>
                        </div>

                        {/* Resume Preview */}
                        <div className="py-8">
                            <div className="max-w-4xl mx-auto px-4">
                                <div className="bg-white shadow-2xl rounded-lg overflow-hidden">
                                    <div
                                        id="resume-preview"
                                        dangerouslySetInnerHTML={{ __html: generatedResume }}
                                        className="bg-white"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default AIResumeBuilder;