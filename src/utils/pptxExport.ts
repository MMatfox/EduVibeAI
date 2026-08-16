import pptxgen from 'pptxgenjs';
import { CoursePayload } from '../types';
import { COURSE_THEMES } from '../data/defaultCourses';

export async function exportCourseToPPTX(course: CoursePayload): Promise<void> {
  const pptx = new pptxgen();
  const theme = COURSE_THEMES[course.themeId] || COURSE_THEMES.indigo;

  // Set presentation layout and properties
  pptx.layout = 'LAYOUT_16x9';
  pptx.author = 'EduVibe AI';
  pptx.company = 'EduVibe Corporate Training';
  pptx.title = course.title;
  pptx.subject = course.topic;

  const primaryHex = theme.pptxPrimary || '4F46E5';
  const secondaryHex = theme.pptxSecondary || '818CF8';
  const darkBgHex = '0F172A';
  const lightBgHex = 'F8FAFC';
  const textDark = '1E293B';
  const textMuted = '64748B';

  // 1. TITLE SLIDE
  const titleSlide = pptx.addSlide();
  titleSlide.background = { color: darkBgHex };

  // Top decorative bar
  titleSlide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: '100%',
    h: 0.15,
    fill: { color: primaryHex }
  });

  // Badge tag
  titleSlide.addShape(pptx.ShapeType.roundRect, {
    x: 0.8,
    y: 1.2,
    w: 3.2,
    h: 0.45,
    rectRadius: 0.1,
    fill: { color: primaryHex },
    line: { color: secondaryHex, width: 1 }
  });
  titleSlide.addText(`EduVibe AI • ${course.audienceLevel.toUpperCase()} LEVEL`, {
    x: 0.8,
    y: 1.2,
    w: 3.2,
    h: 0.45,
    fontSize: 11,
    bold: true,
    color: 'FFFFFF',
    align: 'center',
    valign: 'middle'
  });

  // Main Title
  titleSlide.addText(course.title, {
    x: 0.8,
    y: 2.0,
    w: 11.5,
    h: 2.2,
    fontSize: 32,
    bold: true,
    color: 'FFFFFF',
    fontFace: 'Arial',
    lineSpacing: 38
  });

  // Subtitle / Tagline
  titleSlide.addText(course.tagline || course.description, {
    x: 0.8,
    y: 4.4,
    w: 11.0,
    h: 1.2,
    fontSize: 16,
    color: '94A3B8',
    fontFace: 'Arial'
  });

  // Footer metadata
  titleSlide.addShape(pptx.ShapeType.line, {
    x: 0.8,
    y: 6.2,
    w: 11.7,
    h: 0,
    line: { color: '334155', width: 1 }
  });

  titleSlide.addText(`Topic: ${course.topic} | Target: ${course.audienceLevel} | Duration: ~${course.estimatedDuration} mins`, {
    x: 0.8,
    y: 6.4,
    w: 8.0,
    h: 0.4,
    fontSize: 11,
    color: '64748B'
  });

  titleSlide.addText('Generated with EduVibe AI & Gemini', {
    x: 8.5,
    y: 6.4,
    w: 4.0,
    h: 0.4,
    fontSize: 11,
    color: secondaryHex,
    align: 'right'
  });

  // Title Slide Trainer Notes
  titleSlide.addNotes(
    `[TRAINER WELCOME SCRIPT]\n\n` +
    `Welcome everyone to "${course.title}".\n\n` +
    `Target Duration: ${course.estimatedDuration} minutes.\n` +
    `Audience Level: ${course.audienceLevel}.\n` +
    `Key Goals: Complete interactive lecture, participant Q&A, and practical skills evaluation quiz.`
  );

  // 2. CONTENT SLIDES
  course.slides.forEach((slide) => {
    const s = pptx.addSlide();
    s.background = { color: lightBgHex };

    // Header strip
    s.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 0,
      w: '100%',
      h: 0.9,
      fill: { color: darkBgHex }
    });

    // Category / Slide count badge
    s.addText(`SLIDE ${slide.slideNumber}/${course.slides.length} • ${slide.categoryBadge || 'MODULE CONTENT'}`, {
      x: 0.8,
      y: 0.15,
      w: 8.0,
      h: 0.25,
      fontSize: 9,
      bold: true,
      color: secondaryHex
    });

    // Header Title
    s.addText(slide.title, {
      x: 0.8,
      y: 0.4,
      w: 10.0,
      h: 0.4,
      fontSize: 18,
      bold: true,
      color: 'FFFFFF'
    });

    // Subtitle bar
    s.addText(slide.subtitle, {
      x: 0.8,
      y: 1.05,
      w: 11.5,
      h: 0.4,
      fontSize: 13,
      italic: true,
      color: textMuted
    });

    // LEFT COLUMN: Bullet points card
    s.addShape(pptx.ShapeType.roundRect, {
      x: 0.8,
      y: 1.6,
      w: 6.8,
      h: 4.8,
      rectRadius: 0.08,
      fill: { color: 'FFFFFF' },
      line: { color: 'E2E8F0', width: 1 }
    });

    s.addText('Key Takeaways & Protocols', {
      x: 1.1,
      y: 1.8,
      w: 6.2,
      h: 0.35,
      fontSize: 14,
      bold: true,
      color: primaryHex
    });

    const bulletItems = slide.bullets.map((b) => ({
      text: b,
      options: {
        fontSize: 12,
        color: textDark,
        bullet: true,
        breakLine: true
      }
    }));

    s.addText(bulletItems, {
      x: 1.1,
      y: 2.3,
      w: 6.2,
      h: 3.8,
      lineSpacing: 22,
      valign: 'top'
    });

    // RIGHT COLUMN: Visual Concept / Metric / Framework Card
    s.addShape(pptx.ShapeType.roundRect, {
      x: 7.9,
      y: 1.6,
      w: 4.6,
      h: 4.8,
      rectRadius: 0.08,
      fill: { color: darkBgHex },
      line: { color: primaryHex, width: 1.5 }
    });

    // Visual concept header badge
    s.addShape(pptx.ShapeType.roundRect, {
      x: 8.2,
      y: 1.85,
      w: 4.0,
      h: 0.35,
      rectRadius: 0.06,
      fill: { color: primaryHex }
    });
    s.addText(slide.visualConcept.badge || slide.visualConcept.type.toUpperCase(), {
      x: 8.2,
      y: 1.85,
      w: 4.0,
      h: 0.35,
      fontSize: 10,
      bold: true,
      color: 'FFFFFF',
      align: 'center',
      valign: 'middle'
    });

    s.addText(slide.visualConcept.title, {
      x: 8.2,
      y: 2.3,
      w: 4.0,
      h: 0.6,
      fontSize: 13,
      bold: true,
      color: 'FFFFFF',
      align: 'center'
    });

    if (slide.visualConcept.metric) {
      s.addText(slide.visualConcept.metric, {
        x: 8.2,
        y: 2.9,
        w: 4.0,
        h: 0.8,
        fontSize: 34,
        bold: true,
        color: secondaryHex,
        align: 'center'
      });
      if (slide.visualConcept.metricLabel) {
        s.addText(slide.visualConcept.metricLabel, {
          x: 8.2,
          y: 3.7,
          w: 4.0,
          h: 0.6,
          fontSize: 10,
          color: '94A3B8',
          align: 'center'
        });
      }
    }

    if (slide.visualConcept.details && slide.visualConcept.details.length > 0) {
      const detailsList = slide.visualConcept.details.map((d) => ({
        text: `• ${d}`,
        options: {
          fontSize: 10.5,
          color: 'E2E8F0',
          breakLine: true
        }
      }));

      s.addText(detailsList, {
        x: 8.2,
        y: slide.visualConcept.metric ? 4.3 : 3.0,
        w: 4.0,
        h: slide.visualConcept.metric ? 1.8 : 3.1,
        lineSpacing: 16,
        valign: 'top'
      });
    }

    // Footer
    s.addText(`EduVibe AI Presentation Suite • ${course.title}`, {
      x: 0.8,
      y: 6.8,
      w: 9.0,
      h: 0.3,
      fontSize: 9,
      color: textMuted
    });
    s.addText(`Page ${slide.slideNumber + 1}`, {
      x: 10.5,
      y: 6.8,
      w: 2.0,
      h: 0.3,
      fontSize: 9,
      color: textMuted,
      align: 'right'
    });

    // PRESENTER NOTES: Embedded in the PPTX Presenter View!
    const notesContent =
      `⏱️ RECOMMENDED DURATION: ~${slide.trainerNotes.timeMinutes} minutes\n\n` +
      `🎯 KEY TALKING POINTS:\n` +
      slide.trainerNotes.keyTalkingPoints.map((pt, idx) => `  ${idx + 1}. ${pt}`).join('\n') +
      `\n\n💬 ORAL SCRIPT (What to say):\n"${slide.trainerNotes.oralScript}"\n\n` +
      `🙋 INTERACTIVE PROMPT FOR AUDIENCE:\n"${slide.trainerNotes.interactivePrompt}"`;

    s.addNotes(notesContent);
  });

  // 3. QUIZ SUMMARY SLIDE
  if (course.quiz && course.quiz.length > 0) {
    const quizSlide = pptx.addSlide();
    quizSlide.background = { color: darkBgHex };

    quizSlide.addShape(pptx.ShapeType.roundRect, {
      x: 0.8,
      y: 0.8,
      w: 3.0,
      h: 0.4,
      rectRadius: 0.08,
      fill: { color: primaryHex }
    });
    quizSlide.addText('INTERACTIVE EVALUATION', {
      x: 0.8,
      y: 0.8,
      w: 3.0,
      h: 0.4,
      fontSize: 10,
      bold: true,
      color: 'FFFFFF',
      align: 'center',
      valign: 'middle'
    });

    quizSlide.addText('Knowledge Check & Quiz Questions', {
      x: 0.8,
      y: 1.3,
      w: 11.0,
      h: 0.6,
      fontSize: 24,
      bold: true,
      color: 'FFFFFF'
    });

    course.quiz.slice(0, 3).forEach((q, idx) => {
      const yOffset = 2.1 + idx * 1.5;

      quizSlide.addShape(pptx.ShapeType.roundRect, {
        x: 0.8,
        y: yOffset,
        w: 11.7,
        h: 1.3,
        rectRadius: 0.08,
        fill: { color: '1E293B' },
        line: { color: '334155', width: 1 }
      });

      quizSlide.addText(`Q${idx + 1}. ${q.question}`, {
        x: 1.0,
        y: yOffset + 0.1,
        w: 11.3,
        h: 0.45,
        fontSize: 11.5,
        bold: true,
        color: secondaryHex
      });

      quizSlide.addText(`Correct: ${q.options[q.correctOptionIndex]} — ${q.explanation}`, {
        x: 1.0,
        y: yOffset + 0.6,
        w: 11.3,
        h: 0.55,
        fontSize: 10,
        color: '94A3B8'
      });
    });

    quizSlide.addNotes(
      `[QUIZ REVIEW NOTES]\n\n` +
      `Administer the interactive quiz via EduVibe AI live interface or discuss these questions with the team.\n` +
      `Encourage participants to explain why specific options are wrong to reinforce learning.`
    );
  }

  // Generate and trigger download
  const sanitizedTitle = course.title
    .replace(/[^a-zA-Z0-9-_]/g, '_')
    .substring(0, 35);
  await pptx.writeFile({ fileName: `EduVibe_${sanitizedTitle}.pptx` });
}
