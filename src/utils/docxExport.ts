import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  Table, 
  TableRow, 
  TableCell, 
  WidthType, 
  AlignmentType, 
  BorderStyle, 
  HeadingLevel 
} from 'docx';
import { QuickPrintTemplate, DocumentFormData } from '../types.ts';

/**
 * Generates and downloads a native .docx MS Word file for a QuickPrintTemplate
 */
export async function downloadTemplateAsDocx(
  template: QuickPrintTemplate,
  formData: Record<string, string>,
  brandingNote?: string
) {
  const content = template.contentTemplate(formData);
  const children: (Paragraph | Table)[] = [];

  // Title
  if (content.headerTitle) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 100, after: 80 },
        children: [
          new TextRun({
            text: content.headerTitle,
            bold: true,
            size: 28, // 14pt
            color: '0F172A',
          }),
        ],
      })
    );
  }

  // Subtitle
  if (content.headerSubtitle) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 40, after: 140 },
        children: [
          new TextRun({
            text: content.headerSubtitle,
            italics: true,
            bold: true,
            size: 20, // 10pt
            color: '334155',
          }),
        ],
      })
    );
  }

  // Ref No & Date Header Row Table
  if (content.refNo || content.date) {
    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' },
          bottom: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' },
          left: { style: BorderStyle.NONE, size: 0, color: 'auto' },
          right: { style: BorderStyle.NONE, size: 0, color: 'auto' },
          insideHorizontal: { style: BorderStyle.NONE, size: 0, color: 'auto' },
          insideVertical: { style: BorderStyle.NONE, size: 0, color: 'auto' },
        },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({ text: 'Ref / Reg No: ', bold: true, size: 18 }),
                      new TextRun({ text: content.refNo || 'N/A', size: 18 }),
                    ],
                  }),
                ],
              }),
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                children: [
                  new Paragraph({
                    alignment: AlignmentType.RIGHT,
                    children: [
                      new TextRun({ text: 'Date: ', bold: true, size: 18 }),
                      new TextRun({ text: content.date || new Date().toLocaleDateString('en-IN'), size: 18 }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      })
    );

    // Spacing
    children.push(new Paragraph({ spacing: { after: 120 } }));
  }

  // Sections
  content.sections.forEach((sec) => {
    if (sec.title) {
      children.push(
        new Paragraph({
          spacing: { before: 160, after: 60 },
          children: [
            new TextRun({
              text: sec.title,
              bold: true,
              size: 22, // 11pt
              color: '1E293B',
            }),
          ],
        })
      );
    }

    // Split text by lines
    const lines = sec.content.split('\n');
    lines.forEach((line) => {
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const runs = parts.map((part) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return new TextRun({
            text: part.slice(2, -2),
            bold: true,
            size: 20,
          });
        }
        return new TextRun({
          text: part,
          size: 20,
        });
      });

      children.push(
        new Paragraph({
          spacing: { before: 20, after: 40 },
          children: runs,
        })
      );
    });

    // Optional Table
    if (sec.table) {
      const headerCells = sec.table.headers.map(
        (h) =>
          new TableCell({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: h, bold: true, size: 18 })],
              }),
            ],
          })
      );

      const tableRows = [
        new TableRow({ children: headerCells }),
        ...sec.table.rows.map(
          (row) =>
            new TableRow({
              children: row.map(
                (cell) =>
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: cell, size: 18 })],
                      }),
                    ],
                  })
              ),
            })
        ),
      ];

      children.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: tableRows,
        })
      );

      children.push(new Paragraph({ spacing: { after: 100 } }));
    }
  });

  // Declaration
  if (content.declaration) {
    children.push(
      new Paragraph({
        spacing: { before: 180, after: 120 },
        children: [
          new TextRun({ text: 'DECLARATION: ', bold: true, size: 20 }),
          new TextRun({ text: content.declaration, italics: true, size: 20 }),
        ],
      })
    );
  }

  // Signatures Table
  if (content.signatures && content.signatures.length > 0) {
    const colWidth = Math.floor(100 / content.signatures.length);
    const sigCells = content.signatures.map(
      (sig) =>
        new TableCell({
          width: { size: colWidth, type: WidthType.PERCENTAGE },
          borders: {
            top: { style: BorderStyle.NONE, size: 0, color: 'auto' },
            bottom: { style: BorderStyle.NONE, size: 0, color: 'auto' },
            left: { style: BorderStyle.NONE, size: 0, color: 'auto' },
            right: { style: BorderStyle.NONE, size: 0, color: 'auto' },
          },
          children: [
            new Paragraph({
              alignment:
                sig.position === 'left'
                  ? AlignmentType.LEFT
                  : sig.position === 'right'
                  ? AlignmentType.RIGHT
                  : AlignmentType.CENTER,
              spacing: { before: 300, after: 40 },
              children: [
                new TextRun({
                  text: '_________________________',
                  bold: true,
                  size: 18,
                }),
              ],
            }),
            new Paragraph({
              alignment:
                sig.position === 'left'
                  ? AlignmentType.LEFT
                  : sig.position === 'right'
                  ? AlignmentType.RIGHT
                  : AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: sig.label,
                  bold: true,
                  size: 18,
                }),
              ],
            }),
            ...(sig.subLabel
              ? [
                  new Paragraph({
                    alignment:
                      sig.position === 'left'
                        ? AlignmentType.LEFT
                        : sig.position === 'right'
                        ? AlignmentType.RIGHT
                        : AlignmentType.CENTER,
                    children: [
                      new TextRun({
                        text: sig.subLabel,
                        size: 16,
                        color: '64748B',
                      }),
                    ],
                  }),
                ]
              : []),
          ],
        })
    );

    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: { style: BorderStyle.NONE, size: 0, color: 'auto' },
          bottom: { style: BorderStyle.NONE, size: 0, color: 'auto' },
          left: { style: BorderStyle.NONE, size: 0, color: 'auto' },
          right: { style: BorderStyle.NONE, size: 0, color: 'auto' },
          insideHorizontal: { style: BorderStyle.NONE, size: 0, color: 'auto' },
          insideVertical: { style: BorderStyle.NONE, size: 0, color: 'auto' },
        },
        rows: [new TableRow({ children: sigCells })],
      })
    );
  }

  // Official Note
  if (content.officialNote) {
    children.push(
      new Paragraph({
        spacing: { before: 200, after: 60 },
        children: [
          new TextRun({
            text: content.officialNote,
            italics: true,
            size: 16,
            color: '64748B',
          }),
        ],
      })
    );
  }

  // Footer / Branding
  if (brandingNote) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 160 },
        children: [
          new TextRun({
            text: `${brandingNote} • Generated on ${new Date().toLocaleDateString('en-IN')}`,
            size: 14,
            color: '94A3B8',
          }),
        ],
      })
    );
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const fileName = `${template.id}_${new Date().toISOString().slice(0, 10)}.docx`;
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

/**
 * Exports Document Generator data to MS Word .docx format
 */
export async function downloadDocGeneratorAsDocx(formData: DocumentFormData) {
  const children: (Paragraph | Table)[] = [];

  // Title / Candidate Name
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 80, after: 60 },
      children: [
        new TextRun({
          text: formData.fullName || 'DOCUMENT',
          bold: true,
          size: 32,
          color: '0F172A',
        }),
      ],
    })
  );

  // Subtitle / Contact Line
  const contactInfo = [
    formData.phone ? `Phone: ${formData.phone}` : '',
    formData.email ? `Email: ${formData.email}` : '',
    formData.address ? `Address: ${formData.address}` : '',
  ]
    .filter(Boolean)
    .join('  |  ');

  if (contactInfo) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 160 },
        children: [new TextRun({ text: contactInfo, size: 18, color: '475569' })],
      })
    );
  }

  // Education Section
  if (formData.education && formData.education.length > 0) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 140, after: 60 },
        children: [new TextRun({ text: 'ACADEMIC QUALIFICATIONS', bold: true, size: 22 })],
      })
    );

    const eduRows = [
      new TableRow({
        children: ['Course / Degree', 'Board / University', 'Year', 'Marks / %'].map(
          (h) =>
            new TableCell({
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: h, bold: true, size: 18 })],
                }),
              ],
            })
        ),
      }),
      ...formData.education.map(
        (edu) =>
          new TableRow({
            children: [
              edu.course,
              edu.boardOrUniv,
              edu.passingYear,
              edu.percentageOrCgpa || edu.division || '-',
            ].map(
              (val) =>
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: val, size: 18 })] })],
                })
            ),
          })
      ),
    ];

    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: eduRows,
      })
    );
  }

  // Work Experience
  if (formData.experience && formData.experience.length > 0) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 160, after: 60 },
        children: [new TextRun({ text: 'WORK EXPERIENCE', bold: true, size: 22 })],
      })
    );

    formData.experience.forEach((exp) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${exp.jobTitle} - ${exp.companyName}`, bold: true, size: 20 }),
            new TextRun({ text: ` (${exp.duration})`, italics: true, size: 18, color: '64748B' }),
          ],
        })
      );
      if (exp.description) {
        children.push(
          new Paragraph({
            spacing: { after: 60 },
            children: [new TextRun({ text: exp.description, size: 18 })],
          })
        );
      }
    });
  }

  // Skills
  if (formData.skills) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 140, after: 40 },
        children: [new TextRun({ text: 'TECHNICAL & PROFESSIONAL SKILLS', bold: true, size: 22 })],
      })
    );
    children.push(
      new Paragraph({
        children: [new TextRun({ text: formData.skills, size: 20 })],
      })
    );
  }

  // Declaration
  children.push(
    new Paragraph({
      spacing: { before: 200, after: 120 },
      children: [
        new TextRun({
          text: 'DECLARATION: I hereby declare that all the information given above is true and correct to the best of my knowledge.',
          italics: true,
          size: 18,
        }),
      ],
    })
  );

  // Sign Line
  children.push(
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      spacing: { before: 240 },
      children: [
        new TextRun({
          text: `(${formData.fullName || 'Signature'})`,
          bold: true,
          size: 20,
        }),
      ],
    })
  );

  const doc = new Document({
    sections: [{ properties: {}, children }],
  });

  const blob = await Packer.toBlob(doc);
  const fileName = `${formData.docType}_${(formData.fullName || 'doc').replace(/\s+/g, '_')}.docx`;
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}
