import html2canvas from 'html2canvas';

export function useElementDownload() {
  const downloadElement = async (
    element: HTMLElement,
    filename: string
  ) => {
    try {
      // Find and hide the download button before capturing
      const downloadButton = element.querySelector('button[title="Download as image"]') as HTMLElement;
      if (downloadButton) {
        downloadButton.style.display = 'none';
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        allowTaint: true,
        useCORS: true,
      });

      // Restore the download button after capturing
      if (downloadButton) {
        downloadButton.style.display = '';
      }

      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `${filename}.png`;
      link.click();
      
      // Clean up the link element
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Failed to download element:', error);
      
      // Ensure button is restored even if capture fails
      const downloadButton = element.querySelector('button[title="Download as image"]') as HTMLElement;
      if (downloadButton) {
        downloadButton.style.display = '';
      }
    }
  };

  return { downloadElement };
}
