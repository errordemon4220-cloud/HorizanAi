
import { jsPDF } from 'jspdf';
import { WorkflowExecutionResult } from '../types';

/**
 * Triggers a browser download for the given content.
 * @param blob The Blob object to download.
 * @param fileName The name of the file to be saved.
 */
function triggerDownload(blob: Blob, fileName: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Creates and downloads a text-based file (txt, html, etc.).
 * @param content The string content of the file.
 * @param mimeType The MIME type of the file.
 * @param fileName The name of the file to download.
 */
function downloadTextAsFile(content: string, mimeType: string, fileName: string) {
    const blob = new Blob([content], { type: mimeType });
    triggerDownload(blob, fileName);
}

/**
 * Creates and downloads a PDF from markdown-like text content.
 * @param markdownText The text content, where lines starting with #, ## are treated as headings.
 * @param fileName The name for the downloaded PDF file.
 */
function downloadPdf(markdownText: string, fileName: string) {
    const doc = new jsPDF();
    const margin = 15;
    const pageWidth = doc.internal.pageSize.getWidth();
    const usableWidth = pageWidth - margin * 2;
    let y = margin;

    const addText = (text: string, size: number, style: 'normal' | 'bold' = 'normal') => {
        doc.setFontSize(size);
        doc.setFont('helvetica', style);
        const lines = doc.splitTextToSize(text, usableWidth);
        const requiredHeight = lines.length * (size / 2.5); // Approximation

        if (y + requiredHeight > doc.internal.pageSize.getHeight() - margin) {
            doc.addPage();
            y = margin;
        }

        doc.text(lines, margin, y);
        y += requiredHeight + 4; // Add some padding after
    };

    const lines = markdownText.split('\n');
    lines.forEach(line => {
        if (line.startsWith('# ')) {
            addText(line.substring(2), 18, 'bold');
        } else if (line.startsWith('## ')) {
            addText(line.substring(3), 14, 'bold');
        } else if (line.startsWith('### ')) {
            addText(line.substring(4), 12, 'bold');
        } else {
            addText(line, 11, 'normal');
        }
    });

    doc.save(fileName);
}

/**
 * Handles the download logic for various workflow output types.
 * @param content The main content (text, html, json string).
 * @param outputType The type of the output.
 * @param fileName The suggested file name.
 */
export function downloadFile(content: string, outputType: WorkflowExecutionResult['outputType'], fileName: string) {
    switch (outputType) {
        case 'text':
            downloadTextAsFile(content, 'text/plain;charset=utf-8', fileName);
            break;
        case 'slides': // For JSON content
            downloadTextAsFile(content, 'application/json;charset=utf-8', fileName);
            break;
        case 'website':
            downloadTextAsFile(content, 'text/html;charset=utf-8', fileName);
            break;
        case 'image':
             // Assumes content is a data URL
            fetch(content)
                .then(res => res.blob())
                .then(blob => triggerDownload(blob, fileName));
            break;
        case 'pdf':
            downloadPdf(content, fileName);
            break;
        default:
            console.error(`Unsupported download type: ${outputType}`);
    }
}
