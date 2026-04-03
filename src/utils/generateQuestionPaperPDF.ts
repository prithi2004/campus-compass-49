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
  internal1: "INTERNAL ASSESSMENT TEST – I",
  internal2: "INTERNAL ASSESSMENT TEST – II",
  model: "MODEL EXAMINATION",
  endsem: "END SEMESTER EXAMINATION",
  reexam: "RE-EXAMINATION",
};

const BLOOM_LABELS: Record<string, string> = {
  K1: "Remember",
  K2: "Understand",
  K3: "Apply",
  K4: "Analyse",
  K5: "Evaluate",
  K6: "Create",
};

// Map bloom level strings to K-codes
const getBloomCode = (bloom: string): string => {
  const b = bloom.toLowerCase().trim();
  if (b.startsWith("k") && b.length <= 2) return bloom.toUpperCase();
  if (b === "remember" || b === "remembering") return "K1";
  if (b === "understand" || b === "understanding") return "K2";
  if (b === "apply" || b === "applying" || b === "application") return "K3";
  if (b === "analyse" || b === "analyze" || b === "analysing" || b === "analyzing" || b === "analysis") return "K4";
  if (b === "evaluate" || b === "evaluating" || b === "evaluation") return "K5";
  if (b === "create" || b === "creating" || b === "creation") return "K6";
  return bloom.toUpperCase();
};

// Extract CO number from unit string
const getCO = (unit: string): string => {
  const match = unit.match(/(\d+)/);
  return match ? match[1] : "1";
};

const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

export const generateQuestionPaperPDF = async (
  questions: Question[],
  config: PaperConfig
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 12;
  const tableWidth = pageWidth - margin * 2;
  let y = 14;

  const centerText = (text: string, yPos: number, fontSize = 12, bold = false) => {
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.text(text, pageWidth / 2, yPos, { align: "center" });
  };

  const drawRect = (x: number, yPos: number, w: number, h: number) => {
    doc.setDrawColor(0);
    doc.setLineWidth(0.3);
    doc.rect(x, yPos, w, h);
  };

  const cellText = (text: string, x: number, yPos: number, w: number, h: number, fontSize = 8, bold = false, align: "left" | "center" = "left") => {
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", bold ? "bold" : "normal");
    const padding = 2;
    const maxW = w - padding * 2;
    const lines = doc.splitTextToSize(text, maxW);
    const lineH = fontSize * 0.4;
    const totalTextH = lines.length * lineH;
    const startY = yPos + (h - totalTextH) / 2 + lineH * 0.8;
    if (align === "center") {
      lines.forEach((line: string, i: number) => {
        doc.text(line, x + w / 2, startY + i * lineH, { align: "center" });
      });
    } else {
      doc.text(lines, x + padding, startY);
    }
  };

  const checkPage = (needed: number) => {
    if (y + needed > 280) {
      doc.addPage();
      y = 14;
    }
  };

  // Helper to add watermark on every page
  const addWatermark = () => {
    if (config.watermark) {
      const pageCount = doc.getNumberOfPages();
      for (let p = 1; p <= pageCount; p++) {
        doc.setPage(p);
        doc.setTextColor(240, 240, 240);
        doc.setFontSize(70);
        doc.setFont("helvetica", "bold");
        doc.text("DAIT", pageWidth / 2, 160, { align: "center", angle: 45 });
      }
      doc.setPage(pageCount);
      doc.setTextColor(0, 0, 0);
    }
  };

  // ===== COLLEGE LOGO =====
  try {
    const logoImg = await loadImage("/college-logo.png");
    doc.addImage(logoImg, "PNG", margin, y - 2, 20, 14);
  } catch (e) {
    // Logo not available, skip
  }

  // ===== HEADER =====
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("DHAANISH AHMED", pageWidth / 2 + 5, y, { align: "center" });
  y += 5;
  doc.setFontSize(11);
  doc.text("INSTITUTE OF TECHNOLOGY", pageWidth / 2, y, { align: "center" });
  y += 4;
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "normal");
  doc.text("An Autonomous Institution Approved by AICTE, New Delhi and Affiliated to Anna University, Chennai. An ISO 9001 Certified Institution", pageWidth / 2, y, { align: "center" });
  y += 5;

  // Exam Title
  const examTitle = EXAM_NAMES[config.examName] || config.examName?.toUpperCase() || "EXAMINATION";
  const semesterLabel = config.semester ? (parseInt(config.semester) % 2 === 0 ? "Even" : "Odd") + " Semester" : "";
  const examLine = `${examTitle}${config.academicYear ? ` (${config.academicYear}` : ""}${semesterLabel ? ` : ${semesterLabel})` : config.academicYear ? ")" : ""}`;
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text(examLine, pageWidth / 2, y, { align: "center" });
  y += 6;

  // ===== METADATA TABLE =====
  const metaRowH = 8;
  const col1 = margin;
  const col1W = 28;
  const col2W = 60;
  const col3W = 22;
  const col4W = 18;
  const col5W = 22;
  const col6W = tableWidth - col1W - col2W - col3W - col4W - col5W;

  // Row 1: Programme | value | Regulation | value | Question Set | value
  drawRect(col1, y, col1W, metaRowH);
  cellText("Programme :", col1, y, col1W, metaRowH, 7.5, true);
  drawRect(col1 + col1W, y, col2W, metaRowH);
  cellText(config.department || "", col1 + col1W, y, col2W, metaRowH, 7.5);
  drawRect(col1 + col1W + col2W, y, col3W, metaRowH);
  cellText("Regulation:", col1 + col1W + col2W, y, col3W, metaRowH, 7.5, true);
  drawRect(col1 + col1W + col2W + col3W, y, col4W, metaRowH);
  cellText("2021", col1 + col1W + col2W + col3W, y, col4W, metaRowH, 7.5);
  drawRect(col1 + col1W + col2W + col3W + col4W, y, col5W, metaRowH);
  cellText("Question Set:", col1 + col1W + col2W + col3W + col4W, y, col5W, metaRowH, 7, true);
  drawRect(col1 + col1W + col2W + col3W + col4W + col5W, y, col6W, metaRowH);
  cellText("1", col1 + col1W + col2W + col3W + col4W + col5W, y, col6W, metaRowH, 7.5);
  y += metaRowH;

  // Row 2: Course Code & Title | value | Year/Semester | value | Date | value
  drawRect(col1, y, col1W, metaRowH);
  cellText("Course Code\n& Title:", col1, y, col1W, metaRowH, 7, true);
  drawRect(col1 + col1W, y, col2W, metaRowH);
  cellText(`${config.subjectCode || ""}${config.courseName ? "-" + config.courseName : ""}`, col1 + col1W, y, col2W, metaRowH, 7.5);
  drawRect(col1 + col1W + col2W, y, col3W, metaRowH);
  cellText("Year /\nSemester:", col1 + col1W + col2W, y, col3W, metaRowH, 7, true);
  drawRect(col1 + col1W + col2W + col3W, y, col4W, metaRowH);
  cellText(config.semester || "", col1 + col1W + col2W + col3W, y, col4W, metaRowH, 7.5);
  drawRect(col1 + col1W + col2W + col3W + col4W, y, col5W, metaRowH);
  cellText("Date:", col1 + col1W + col2W + col3W + col4W, y, col5W, metaRowH, 7.5, true);
  drawRect(col1 + col1W + col2W + col3W + col4W + col5W, y, col6W, metaRowH);
  cellText(config.examDate || "", col1 + col1W + col2W + col3W + col4W + col5W, y, col6W, metaRowH, 7.5);
  y += metaRowH;

  // Row 3: Maximum Marks | value | Time | value
  const halfW = tableWidth / 2;
  drawRect(col1, y, col1W, metaRowH);
  cellText("Maximum\nMarks:", col1, y, col1W, metaRowH, 7, true);
  drawRect(col1 + col1W, y, halfW - col1W, metaRowH);
  cellText(config.maxMarks || "", col1 + col1W, y, halfW - col1W, metaRowH, 7.5);
  drawRect(col1 + halfW, y, 16, metaRowH);
  cellText("Time:", col1 + halfW, y, 16, metaRowH, 7.5, true);
  drawRect(col1 + halfW + 16, y, halfW - 16, metaRowH);
  cellText(config.duration ? `${config.duration} Hour(s)` : "", col1 + halfW + 16, y, halfW - 16, metaRowH, 7.5);
  y += metaRowH + 4;

  // ===== BLOOM'S TAXONOMY TABLE =====
  const bloomRowH = 7;
  const bloomLabelW = 28;
  const bloomPairW = (tableWidth - bloomLabelW) / 3;
  const bloomCodeW = 10;
  const bloomDescW = bloomPairW - bloomCodeW;

  drawRect(col1, y, bloomLabelW, bloomRowH * 2);
  cellText("Bloom's\nTaxonomy Level", col1, y, bloomLabelW, bloomRowH * 2, 7, true);

  // Row 1: K1, K2, K3
  const bloomRow1 = [
    { code: "K1", label: "Remember" },
    { code: "K2", label: "Understand" },
    { code: "K3", label: "Apply" },
  ];
  bloomRow1.forEach((b, i) => {
    const bx = col1 + bloomLabelW + i * bloomPairW;
    drawRect(bx, y, bloomCodeW, bloomRowH);
    cellText(b.code, bx, y, bloomCodeW, bloomRowH, 7, true, "center");
    drawRect(bx + bloomCodeW, y, bloomDescW, bloomRowH);
    cellText(b.label, bx + bloomCodeW, y, bloomDescW, bloomRowH, 7);
  });
  y += bloomRowH;

  // Row 2: K4, K5, K6
  const bloomRow2 = [
    { code: "K4", label: "Analyse" },
    { code: "K5", label: "Evaluate" },
    { code: "K6", label: "Create" },
  ];
  bloomRow2.forEach((b, i) => {
    const bx = col1 + bloomLabelW + i * bloomPairW;
    drawRect(bx, y, bloomCodeW, bloomRowH);
    cellText(b.code, bx, y, bloomCodeW, bloomRowH, 7, true, "center");
    drawRect(bx + bloomCodeW, y, bloomDescW, bloomRowH);
    cellText(b.label, bx + bloomCodeW, y, bloomDescW, bloomRowH, 7);
  });
  y += bloomRowH + 5;

  // ===== QUESTIONS =====
  const partAQuestions = questions.filter(q => q.marks <= config.partA.marks);
  const partBQuestions = questions.filter(q => q.marks > config.partA.marks && q.marks <= config.partB.marks);
  const partCQuestions = questions.filter(q => q.marks > config.partB.marks);

  // Question table column widths
  const qNoW = 12;
  const marksW = 14;
  const coW = 12;
  const blW = 12;
  const qTextW = tableWidth - qNoW - marksW - coW - blW;

  const drawQuestionTableHeader = () => {
    const hdrH = 7;
    drawRect(margin, y, qNoW, hdrH);
    cellText("Q.No", margin, y, qNoW, hdrH, 7.5, true, "center");
    drawRect(margin + qNoW, y, qTextW, hdrH);
    cellText("Questions", margin + qNoW, y, qTextW, hdrH, 7.5, true, "center");
    drawRect(margin + qNoW + qTextW, y, marksW, hdrH);
    cellText("Marks", margin + qNoW + qTextW, y, marksW, hdrH, 7.5, true, "center");
    drawRect(margin + qNoW + qTextW + marksW, y, coW, hdrH);
    cellText("CO", margin + qNoW + qTextW + marksW, y, coW, hdrH, 7.5, true, "center");
    drawRect(margin + qNoW + qTextW + marksW + coW, y, blW, hdrH);
    cellText("BL", margin + qNoW + qTextW + marksW + coW, y, blW, hdrH, 7.5, true, "center");
    y += hdrH;
  };

  const getRowHeight = (text: string): number => {
    doc.setFontSize(8);
    const lines = doc.splitTextToSize(text, qTextW - 4);
    return Math.max(8, lines.length * 3.5 + 4);
  };

  const drawQuestionRow = (qNum: string, text: string, marks: number, co: string, bl: string, rowH?: number) => {
    const rH = rowH || getRowHeight(text);
    checkPage(rH + 2);
    drawRect(margin, y, qNoW, rH);
    cellText(qNum, margin, y, qNoW, rH, 8, false, "center");
    drawRect(margin + qNoW, y, qTextW, rH);
    cellText(text, margin + qNoW, y, qTextW, rH, 8);
    drawRect(margin + qNoW + qTextW, y, marksW, rH);
    cellText(String(marks), margin + qNoW + qTextW, y, marksW, rH, 8, false, "center");
    drawRect(margin + qNoW + qTextW + marksW, y, coW, rH);
    cellText(co, margin + qNoW + qTextW + marksW, y, coW, rH, 8, false, "center");
    drawRect(margin + qNoW + qTextW + marksW + coW, y, blW, rH);
    cellText(bl, margin + qNoW + qTextW + marksW + coW, y, blW, rH, 8, false, "center");
    y += rH;
  };

  // ===== PART A =====
  if (partAQuestions.length > 0) {
    checkPage(20);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    const partALabel = `Part – A : Answer all the Questions`;
    const partAMarks = `${config.partA.questions} x ${config.partA.marks} = ${config.partA.total} Marks`;
    doc.text(partALabel, pageWidth / 2 - 20, y, { align: "center" });
    doc.text(partAMarks, pageWidth - margin, y, { align: "right" });
    y += 4;

    drawQuestionTableHeader();

    partAQuestions.forEach((q, idx) => {
      drawQuestionRow(
        String(idx + 1),
        q.text,
        q.marks,
        getCO(q.unit),
        getBloomCode(q.bloomLevel)
      );
    });

    y += 5;
  }

  // ===== PART B (with OR choices) =====
  let qNum = partAQuestions.length + 1;

  if (partBQuestions.length > 0) {
    checkPage(20);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    const partBLabel = `Part – B : Answer all the Questions`;
    const partBMarks = `${config.partB.questions} x ${config.partB.marks} = ${config.partB.total} Marks`;
    doc.text(partBLabel, pageWidth / 2 - 20, y, { align: "center" });
    doc.text(partBMarks, pageWidth - margin, y, { align: "right" });
    y += 4;

    drawQuestionTableHeader();

    for (let i = 0; i < partBQuestions.length; i += 2) {
      const qA = partBQuestions[i];
      const qB = i + 1 < partBQuestions.length ? partBQuestions[i + 1] : null;

      // Calculate total height for the combined row
      const textA = `(i) ${qA.text}`;
      const textB = qB ? `(ii) ${qB.text}` : "";
      const hA = getRowHeight(textA);
      const orH = 5;
      const hB = qB ? getRowHeight(textB) : 0;
      const totalH = hA + (qB ? orH + hB : 0);

      checkPage(totalH + 4);

      // Draw the combined cell borders for Q.No, Marks, CO, BL spanning full height
      drawRect(margin, y, qNoW, totalH);
      cellText(String(qNum), margin, y, qNoW, totalH, 8, false, "center");
      drawRect(margin + qNoW + qTextW, y, marksW, totalH);
      cellText(String(qA.marks), margin + qNoW + qTextW, y, marksW, totalH, 8, false, "center");
      drawRect(margin + qNoW + qTextW + marksW, y, coW, totalH);
      cellText(getCO(qA.unit), margin + qNoW + qTextW + marksW, y, coW, totalH / 2, 8, false, "center");
      drawRect(margin + qNoW + qTextW + marksW + coW, y, blW, totalH);

      // BL for option (i)
      const blA = getBloomCode(qA.bloomLevel);
      cellText(blA, margin + qNoW + qTextW + marksW + coW, y, blW, hA, 8, false, "center");

      // Question text area border
      drawRect(margin + qNoW, y, qTextW, totalH);

      // Option (i) text
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      const linesA = doc.splitTextToSize(textA, qTextW - 4);
      doc.text(linesA, margin + qNoW + 2, y + 4);
      y += hA;

      if (qB) {
        // (OR) separator
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.text("(OR)", margin + qNoW + qTextW / 2, y + 3, { align: "center" });

        // CO and BL for option (ii)
        cellText(getCO(qB.unit), margin + qNoW + qTextW + marksW, y - hA + totalH / 2, coW, totalH / 2, 8, false, "center");
        const blB = getBloomCode(qB.bloomLevel);
        cellText(blB, margin + qNoW + qTextW + marksW + coW, y, blW, orH + hB, 8, false, "center");

        y += orH;

        // Option (ii) text
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        const linesB = doc.splitTextToSize(textB, qTextW - 4);
        doc.text(linesB, margin + qNoW + 2, y + 4);
        y += hB;
      }

      qNum++;
    }
    y += 5;
  }

  // ===== PART C (with OR choices) =====
  if (partCQuestions.length > 0) {
    checkPage(20);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    const partCLabel = `Part – C : Answer all the Questions`;
    const partCMarks = `${config.partC.questions} x ${config.partC.marks} = ${config.partC.total} Marks`;
    doc.text(partCLabel, pageWidth / 2 - 20, y, { align: "center" });
    doc.text(partCMarks, pageWidth - margin, y, { align: "right" });
    y += 4;

    drawQuestionTableHeader();

    for (let i = 0; i < partCQuestions.length; i += 2) {
      const qA = partCQuestions[i];
      const qB = i + 1 < partCQuestions.length ? partCQuestions[i + 1] : null;

      const textA = `(i) ${qA.text}`;
      const textB = qB ? `(ii) ${qB.text}` : "";
      const hA = getRowHeight(textA);
      const orH = 5;
      const hB = qB ? getRowHeight(textB) : 0;
      const totalH = hA + (qB ? orH + hB : 0);

      checkPage(totalH + 4);

      drawRect(margin, y, qNoW, totalH);
      cellText(String(qNum), margin, y, qNoW, totalH, 8, false, "center");
      drawRect(margin + qNoW + qTextW, y, marksW, totalH);
      cellText(String(qA.marks), margin + qNoW + qTextW, y, marksW, totalH, 8, false, "center");
      drawRect(margin + qNoW + qTextW + marksW, y, coW, totalH);
      cellText(getCO(qA.unit), margin + qNoW + qTextW + marksW, y, coW, totalH / 2, 8, false, "center");
      drawRect(margin + qNoW + qTextW + marksW + coW, y, blW, totalH);
      cellText(getBloomCode(qA.bloomLevel), margin + qNoW + qTextW + marksW + coW, y, blW, hA, 8, false, "center");

      drawRect(margin + qNoW, y, qTextW, totalH);

      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      const linesA = doc.splitTextToSize(textA, qTextW - 4);
      doc.text(linesA, margin + qNoW + 2, y + 4);
      y += hA;

      if (qB) {
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.text("(OR)", margin + qNoW + qTextW / 2, y + 3, { align: "center" });

        cellText(getCO(qB.unit), margin + qNoW + qTextW + marksW, y - hA + totalH / 2, coW, totalH / 2, 8, false, "center");
        cellText(getBloomCode(qB.bloomLevel), margin + qNoW + qTextW + marksW + coW, y, blW, orH + hB, 8, false, "center");

        y += orH;

        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        const linesB = doc.splitTextToSize(textB, qTextW - 4);
        doc.text(linesB, margin + qNoW + 2, y + 4);
        y += hB;
      }

      qNum++;
    }
    y += 5;
  }

  // Footer
  checkPage(12);
  y += 4;
  centerText("*** All the Best ***", y, 10, true);

  // Add watermark on all pages
  addWatermark();

  // Save
  const fileName = `${config.subjectCode || "exam"}_${config.examName || "paper"}_QuestionPaper.pdf`;
  doc.save(fileName);
};
