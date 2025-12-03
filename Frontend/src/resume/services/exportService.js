import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Export Resume as PDF
export const exportAsPDF = async (resumeElement, fileName = 'resume.pdf') => {
  try {
    const canvas = await html2canvas(resumeElement, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(fileName);
    return { success: true, message: 'PDF downloaded successfully' };
  } catch (error) {
    console.error('Error generating PDF:', error);
    return { success: false, message: 'Failed to generate PDF' };
  }
};

// Export Resume as DOCX (requires docx library)
export const exportAsDOCX = (resumeData, fileName = 'resume.docx') => {
  try {
    // Simple DOCX export - in production, use docx library
    const content = formatResumeAsText(resumeData);
    const blob = new Blob([content], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    return { success: true, message: 'DOCX downloaded successfully' };
  } catch (error) {
    console.error('Error generating DOCX:', error);
    return { success: false, message: 'Failed to generate DOCX' };
  }
};

// Export Resume as Plain Text
export const exportAsText = (resumeData, fileName = 'resume.txt') => {
  try {
    const content = formatResumeAsText(resumeData);
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    return { success: true, message: 'Text file downloaded successfully' };
  } catch (error) {
    console.error('Error generating text:', error);
    return { success: false, message: 'Failed to generate text file' };
  }
};

// Export Resume as JSON
export const exportAsJSON = (resumeData, fileName = 'resume.json') => {
  try {
    const jsonString = JSON.stringify(resumeData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    return { success: true, message: 'JSON file downloaded successfully' };
  } catch (error) {
    console.error('Error generating JSON:', error);
    return { success: false, message: 'Failed to generate JSON file' };
  }
};

// Format Resume as Plain Text
const formatResumeAsText = (data) => {
  let text = '';
  
  text += `${data.fullName}\n`;
  text += `${data.email} | ${data.phone} | ${data.location}\n`;
  text += `${'='.repeat(80)}\n\n`;
  
  if (data.summary) {
    text += `PROFESSIONAL SUMMARY\n`;
    text += `${data.summary}\n\n`;
  }
  
  if (data.experience && data.experience.length > 0) {
    text += `EXPERIENCE\n`;
    data.experience.forEach(exp => {
      text += `${exp.position} at ${exp.company}\n`;
      text += `${exp.duration}\n`;
      text += `${exp.description}\n\n`;
    });
  }
  
  if (data.education && data.education.length > 0) {
    text += `EDUCATION\n`;
    data.education.forEach(edu => {
      text += `${edu.degree} in ${edu.field}\n`;
      text += `${edu.school}, ${edu.year}\n\n`;
    });
  }
  
  if (data.skills && data.skills.length > 0) {
    text += `SKILLS\n`;
    text += `${data.skills.join(', ')}\n\n`;
  }
  
  return text;
};

// Generate Resume Summary
export const generateResumeSummary = (resumeData) => {
  const totalExperience = resumeData.experience.length;
  const yearsOfExperience = resumeData.experience.length > 0 ? '5+' : '0';
  const skillCount = resumeData.skills.length;
  
  return `Experienced professional with ${yearsOfExperience} years of experience and expertise in ${resumeData.skills.slice(0, 3).join(', ')}. Proven track record in delivering high-quality results.`;
};

// Generate LinkedIn Summary
export const generateLinkedInSummary = (resumeData) => {
  const skills = resumeData.skills.slice(0, 5).join(', ');
  return `Passionate professional with expertise in ${skills}. Strong track record of delivering impactful solutions. Always eager to learn new technologies and collaborate with talented teams.`;
};

// Generate Cover Letter
export const generateCoverLetter = (resumeData, jobRole = 'the position') => {
  const template = `Dear Hiring Manager,

I am writing to express my strong interest in the ${jobRole} position. With my background in ${resumeData.skills.slice(0, 2).join(' and ')}, I am confident in my ability to contribute significantly to your team.

Throughout my career, I have developed a strong foundation in ${resumeData.skills.join(', ')}. My experience includes ${resumeData.experience.map(e => e.position).join(', ')}, where I consistently delivered results that exceeded expectations.

I am particularly interested in this opportunity because of your company's innovative approach and commitment to excellence. I am excited about the possibility of bringing my skills and experience to contribute to your team's success.

Thank you for considering my application. I look forward to discussing how my background aligns with your needs.

Best regards,
${resumeData.fullName}`;
  
  return template;
};
