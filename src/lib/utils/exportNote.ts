import { jsPDF } from 'jspdf';
import JSZip from 'jszip';
import { Note } from '@/types/note';

/**
 * Strips HTML tags and decodes basic entities to yield clean plain text.
 */
export function htmlToPlainText(html: string): string {
  if (typeof window === 'undefined') return html;
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  return tempDiv.textContent || tempDiv.innerText || '';
}

/**
 * Basic HTML to Markdown converter for note exports.
 */
export function htmlToMarkdown(html: string): string {
  let md = html;
  
  // Headings
  md = md.replace(/<h1>(.*?)<\/h1>/gi, '# $1\n\n');
  md = md.replace(/<h2>(.*?)<\/h2>/gi, '## $1\n\n');
  md = md.replace(/<h3>(.*?)<\/h3>/gi, '### $1\n\n');
  
  // Lists
  md = md.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, '$1\n');
  md = md.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, '$1\n');
  md = md.replace(/<li>(.*?)<\/li>/gi, '* $1\n');
  
  // Code Blocks & Inline Code
  md = md.replace(/<pre><code>([\s\S]*?)<\/code><\/pre>/gi, '```\n$1\n```\n\n');
  md = md.replace(/<code>(.*?)<\/code>/gi, '`$1`');
  
  // Blockquotes
  md = md.replace(/<blockquote>([\s\S]*?)<\/blockquote>/gi, '> $1\n\n');
  
  // Bold & Italic
  md = md.replace(/<strong>(.*?)<\/strong>/gi, '**$1**');
  md = md.replace(/<b>(.*?)<\/b>/gi, '**$1**');
  md = md.replace(/<em>(.*?)<\/em>/gi, '*$1*');
  md = md.replace(/<i>(.*?)<\/i>/gi, '*$1*');
  
  // Links
  md = md.replace(/<a\s+(?:[^>]*?\s+)?href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)');
  
  // Paragraph endings and line breaks
  md = md.replace(/<\/p>/gi, '\n\n');
  md = md.replace(/<p>/gi, '');
  md = md.replace(/<br\s*\/?>/gi, '\n');
  
  // Strip remaining HTML tags
  md = md.replace(/<[^>]+>/g, '');
  
  // Unescape entities
  md = md.replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&amp;/g, '&')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'");

  return md.trim();
}

/**
 * Downloads a string as a file.
 */
function downloadFile(content: string, filename: string, contentType: string): void {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Export single note as Markdown
 */
export function exportAsMarkdown(title: string, contentHtml: string): void {
  const markdown = `# ${title}\n\n${htmlToMarkdown(contentHtml)}`;
  const filename = `${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.md`;
  downloadFile(markdown, filename, 'text/markdown;charset=utf-8');
}

/**
 * Export single note as Plain Text
 */
export function exportAsPlainText(title: string, contentHtml: string): void {
  const plainText = `${title}\n\n${htmlToPlainText(contentHtml)}`;
  const filename = `${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.txt`;
  downloadFile(plainText, filename, 'text/plain;charset=utf-8');
}

/**
 * Export single note as PDF using jsPDF (programmatic download)
 */
export function exportAsPDF(title: string, contentHtml: string): void {
  const doc = new jsPDF();
  const plainText = htmlToPlainText(contentHtml);
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text(title, 20, 20);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  
  const splitText = doc.splitTextToSize(plainText, 170);
  let y = 32;
  const pageHeight = doc.internal.pageSize.height;
  
  splitText.forEach((line: string) => {
    if (y > pageHeight - 20) {
      doc.addPage();
      y = 20;
    }
    doc.text(line, 20, y);
    y += 6;
  });
  
  const filename = `${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.pdf`;
  doc.save(filename);
}

/**
 * Export all notes as a ZIP file, structured by folders.
 */
export async function exportAllNotesAsZIP(notes: Note[], foldersMap: Record<string, string>): Promise<void> {
  const zip = new JSZip();
  
  notes.forEach((note) => {
    const mdContent = `# ${note.title}\n\n${htmlToMarkdown(note.content)}`;
    
    // Retrieve the folder structure name
    const folderName = note.folderId && foldersMap[note.folderId] 
      ? foldersMap[note.folderId].replace(/[^a-zA-Z0-9\s]/g, '')
      : 'Unassigned';
      
    const sanitizedTitle = note.title.replace(/[^a-zA-Z0-9\s]/g, '_') || 'untitled';
    const filePath = `${folderName}/${sanitizedTitle}.md`;
    
    zip.file(filePath, mdContent);
  });
  
  const content = await zip.generateAsync({ type: 'blob' });
  const filename = `notes_export_${Date.now()}.zip`;
  
  const url = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
