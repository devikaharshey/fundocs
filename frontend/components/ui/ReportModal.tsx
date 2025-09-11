import { Button } from "@/components/ui/button";
import { jsPDF } from "jspdf";
import { marked } from "marked";
import html2canvas from "html2canvas";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: string;
}

export default function ReportModal({
  isOpen,
  onClose,
  report,
}: ReportModalProps) {
  if (!isOpen) return null;

  const downloadMarkdown = () => {
    const blob = new Blob([report], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "progress_report.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPDF = async () => {
    // Convert markdown to HTML
    const htmlContent = await marked(report);

    // Create a hidden container to render HTML
    const container = document.createElement("div");
    container.innerHTML = htmlContent;
    container.style.fontFamily = "Arial, Noto Color Emoji, sans-serif";
    container.style.fontSize = "16px";
    container.style.lineHeight = "1.6";
    container.style.color = "#000";
    container.style.padding = "20px";
    container.style.backgroundColor = "white";
    container.style.width = "800px";

    // Style headings
    container.querySelectorAll("h1").forEach((el) => {
      const heading = el as HTMLElement;
      heading.style.color = "#F02E65";
      heading.style.fontSize = "28px";
      heading.style.fontWeight = "700";
      heading.style.marginBottom = "12px";
    });

    container.querySelectorAll("h2").forEach((el) => {
      const heading = el as HTMLElement;
      heading.style.color = "#8E51FF";
      heading.style.fontSize = "24px";
      heading.style.fontWeight = "700";
      heading.style.marginBottom = "10px";
    });

    container.querySelectorAll("h3").forEach((el) => {
      const heading = el as HTMLElement;
      heading.style.color = "#333";
      heading.style.fontSize = "20px";
      heading.style.fontWeight = "700";
      heading.style.marginBottom = "8px";
    });

    // Style paragraphs
    container.querySelectorAll("p").forEach((el) => {
      const p = el as HTMLElement;
      p.style.marginBottom = "10px";
    });

    // Style lists
    container.querySelectorAll("ul, ol").forEach((el) => {
      const list = el as HTMLElement;
      list.style.marginBottom = "10px";
      list.style.paddingLeft = "20px";
    });

    // Style blockquotes
    container.querySelectorAll("blockquote").forEach((el) => {
      const quote = el as HTMLElement;
      quote.style.fontStyle = "italic";
      quote.style.color = "#555";
      quote.style.borderLeft = "4px solid #ccc";
      quote.style.paddingLeft = "10px";
      quote.style.marginBottom = "10px";
    });

    // Style code blocks
    container.querySelectorAll("pre").forEach((el) => {
      const codeBlock = el as HTMLElement;
      codeBlock.style.backgroundColor = "#f5f5f5";
      codeBlock.style.padding = "10px";
      codeBlock.style.borderRadius = "6px";
      codeBlock.style.overflowX = "auto";
      codeBlock.style.marginBottom = "10px";
      codeBlock.style.fontFamily = "Courier, monospace";
      codeBlock.style.fontSize = "14px";
    });

    document.body.appendChild(container);

    // Render HTML to canvas
    const canvas = await html2canvas(container, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4",
    });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pageWidth - 40; // 20pt margin
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    const position = 20;

    // Split content into pages if needed
    if (pdfHeight < pageHeight) {
      pdf.addImage(imgData, "PNG", 20, position, pdfWidth, pdfHeight);
    } else {
      let remainingHeight = pdfHeight;
      const pageCanvas = document.createElement("canvas");
      pageCanvas.width = canvas.width;
      pageCanvas.height = canvas.height;
      const ctx = pageCanvas.getContext("2d")!;

      while (remainingHeight > 0) {
        ctx.clearRect(0, 0, pageCanvas.width, pageCanvas.height);
        ctx.drawImage(
          canvas,
          0,
          pdfHeight - remainingHeight,
          canvas.width,
          pageHeight * (canvas.height / pdfHeight),
          0,
          0,
          pageCanvas.width,
          pageCanvas.height
        );
        const pageData = pageCanvas.toDataURL("image/png");
        pdf.addImage(pageData, "PNG", 20, 20, pdfWidth, pageHeight - 40);
        remainingHeight -= pageHeight - 40;
        if (remainingHeight > 0) pdf.addPage();
      }
    }

    pdf.save("Progress_Report.pdf");
    document.body.removeChild(container);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-gray-800 p-6 rounded-xl max-w-2xl w-full relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-100"
        >
          ✕
        </button>
        <h2 className="text-xl font-bold mb-4 text-gray-100">
          Your Progress Report
        </h2>

        <div className="max-h-96 overflow-y-auto scrollbar-hidden text-gray-200 whitespace-pre-wrap">
          <pre>{report}</pre>
        </div>

        <div className="mt-4 flex gap-2">
          <Button onClick={downloadMarkdown}>Download Markdown</Button>
          <Button onClick={downloadPDF}>Download PDF</Button>
        </div>
      </div>
    </div>
  );
}
