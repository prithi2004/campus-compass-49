import jsPDF from "jspdf";

interface Question {
  id: number;
  text: string;
  type: string;
  marks: number;
  unit: string;
  difficulty: string;
  bloomLevel: string;
}

interface PaperConfig {
  examName: string;
  academicYear: string;
  semester: string;
  department: string;
  courseName: string;
  subjectCode: string;
  examDate: string;
  duration: string;
  maxMarks: string;
  partA: { questions: number; marks: number; total: number };
  partB: { questions: number; marks: number; total: number };
  partC: { questions: number; marks: number; total: number };
  watermark: boolean;
  includeAnswerKey: boolean;
}

const EXAM_NAMES: Record<string, string> = {
  internal1: "Internal Test 1",
  internal2: "Internal Test 2",
  model: "Model Exam",
  endsem: "End Semester Exam",
  reexam: "Re-Examination",
};

export const generateQuestionPaperPDF = (
  questions: Question[],
  config: PaperConfig
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  const centerText = (text: string, yPos: number, fontSize = 12, bold = false) => {
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.text(text, pageWidth / 2, yPos, { align: "center" });
  };

  const addLine = (text: string, x: number, yPos: number, fontSize = 11, bold = false) => {
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.text(text, x, yPos);
    return yPos;
  };

  const checkPage = (needed: number) => {
    if (y + needed > 275) {
      doc.addPage();
      y = 20;
    }
  };

  // Watermark
  if (config.watermark) {
    doc.setTextColor(230, 230, 230);
    doc.setFontSize(50);
    doc.setFont("helvetica", "bold");
    doc.text("CONFIDENTIAL", pageWidth / 2, 150, { align: "center", angle: 45 });
    doc.setTextColor(0, 0, 0);
  }

  // Header
  centerText("DHAANISH AHMED COLLEGE OF ENGINEERING", y, 16, true);
  y += 8;
  centerText(EXAM_NAMES[config.examName] || config.examName || "Examination", y, 13, true);
  y += 8;

  // Draw a line
  doc.setDrawColor(0);
  doc.setLineWidth(0.5);
  doc.line(15, y, pageWidth - 15, y);
  y += 8;

  // Exam details - two column layout
  const leftX = 18;
  const rightX = pageWidth / 2 + 10;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  if (config.department) {
    doc.text(`Department: ${config.department}`, leftX, y);
  }
  if (config.academicYear) {
    doc.text(`Academic Year: ${config.academicYear}`, rightX, y);
  }
  y += 6;

  if (config.subjectCode) {
    doc.text(`Subject Code: ${config.subjectCode}`, leftX, y);
  }
  if (config.courseName) {
    doc.text(`Subject: ${config.courseName}`, rightX, y);
  }
  y += 6;

  if (config.semester) {
    doc.text(`Semester: ${config.semester}`, leftX, y);
  }
  if (config.examDate) {
    doc.text(`Date: ${config.examDate}`, rightX, y);
  }
  y += 6;

  if (config.duration) {
    doc.text(`Duration: ${config.duration} Hour(s)`, leftX, y);
  }
  if (config.maxMarks) {
    doc.text(`Max. Marks: ${config.maxMarks}`, rightX, y);
  }
  y += 8;

  // Line separator
  doc.line(15, y, pageWidth - 15, y);
  y += 6;

  // Instructions
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Instructions:", leftX, y);
  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`1. Answer all questions in Part A. (${config.partA.questions} × ${config.partA.marks} = ${config.partA.total} marks)`, leftX, y); y += 4;
  doc.text(`2. Answer any ${config.partB.questions} questions from Part B. (${config.partB.questions} × ${config.partB.marks} = ${config.partB.total} marks)`, leftX, y); y += 4;
  doc.text(`3. Answer any ${config.partC.questions} questions from Part C. (${config.partC.questions} × ${config.partC.marks} = ${config.partC.total} marks)`, leftX, y); y += 4;
  doc.text("4. Draw neat diagrams wherever necessary.", leftX, y); y += 8;

  // Separator
  doc.line(15, y, pageWidth - 15, y);
  y += 8;

  // Group questions by part based on marks
  const partAQuestions = questions.filter(q => q.marks <= config.partA.marks);
  const partBQuestions = questions.filter(q => q.marks > config.partA.marks && q.marks <= config.partB.marks);
  const partCQuestions = questions.filter(q => q.marks > config.partB.marks);

  const hasGrouping = partAQuestions.length > 0 || partBQuestions.length > 0 || partCQuestions.length > 0;

  // Render Part A - answer all, simple numbered list
  const renderPartA = (qs: Question[], startNum: number) => {
    if (qs.length === 0) return startNum;
    checkPage(15);
    centerText(`PART A - Answer all questions (${config.partA.marks} marks each)`, y, 12, true);
    y += 8;

    qs.forEach((q, idx) => {
      const qNum = startNum + idx;
      const lines = doc.splitTextToSize(`${qNum}. ${q.text}`, pageWidth - 50);
      checkPage(lines.length * 5 + 8);
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(lines, leftX, y);
      doc.setFontSize(9);
      doc.text(`[${q.marks} marks]`, pageWidth - 35, y);
      y += lines.length * 5 + 4;
    });
    y += 4;
    return startNum + qs.length;
  };

  // Render Part B/C - paired as "a) or b)" either/or choices
  const renderPartWithChoices = (qs: Question[], partLabel: string, answerCount: number, marksEach: number, startNum: number) => {
    if (qs.length === 0) return startNum;
    checkPage(15);
    centerText(`${partLabel} - Answer any ${answerCount} questions (${marksEach} marks each)`, y, 12, true);
    y += 8;

    let qNum = startNum;
    for (let i = 0; i < qs.length; i += 2) {
      checkPage(25);

      // Question number header
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(`${qNum}.`, leftX, y);
      y += 1;

      // Option (a)
      const qA = qs[i];
      const linesA = doc.splitTextToSize(`(a) ${qA.text}`, pageWidth - 55);
      checkPage(linesA.length * 5 + 8);
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(linesA, leftX + 8, y);
      doc.setFontSize(9);
      doc.text(`[${marksEach} marks]`, pageWidth - 35, y);
      y += linesA.length * 5 + 3;

      // Option (b) if available
      if (i + 1 < qs.length) {
        centerText("(OR)", y, 9, true);
        y += 5;

        const qB = qs[i + 1];
        const linesB = doc.splitTextToSize(`(b) ${qB.text}`, pageWidth - 55);
        checkPage(linesB.length * 5 + 8);
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.text(linesB, leftX + 8, y);
        doc.setFontSize(9);
        doc.text(`[${marksEach} marks]`, pageWidth - 35, y);
        y += linesB.length * 5 + 3;
      }

      y += 4;
      qNum++;
    }
    y += 4;
    return qNum;
  };

  if (hasGrouping && (partAQuestions.length + partBQuestions.length + partCQuestions.length) === questions.length) {
    let num = 1;
    num = renderPartA(partAQuestions, num);
    num = renderPartWithChoices(partBQuestions, "PART B", config.partB.questions, config.partB.marks, num);
    renderPartWithChoices(partCQuestions, "PART C", config.partC.questions, config.partC.marks, num);
  } else {
    // Render all questions flat
    questions.forEach((q, idx) => {
      const lines = doc.splitTextToSize(`${idx + 1}. ${q.text}`, pageWidth - 50);
      checkPage(lines.length * 5 + 8);
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(lines, leftX, y);
      doc.setFontSize(9);
      doc.text(`[${q.marks} marks]`, pageWidth - 35, y);
      y += lines.length * 5 + 4;
    });
  }

  // Footer
  checkPage(20);
  y += 10;
  doc.line(15, y, pageWidth - 15, y);
  y += 6;
  centerText("*** All the Best ***", y, 11, true);

  // Save
  const fileName = `Question_Paper_${config.subjectCode || "exam"}_${config.examDate || "draft"}.pdf`;
  doc.save(fileName);
};
