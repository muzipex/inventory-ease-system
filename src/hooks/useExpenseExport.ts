
import { Expense } from './useExpenses';
import { useToast } from './use-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export const useExpenseExport = () => {
  const { toast } = useToast();

  const exportToCSV = (expenses: Expense[]) => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Date,Category,Amount,Payment Method,Supplier,Description,Recurring\n"
      + expenses.map(expense => 
          `${expense.expense_date},${expense.expense_categories?.name || ''},${expense.amount},${expense.payment_method},"${expense.supplier_name || ''}","${expense.description || ''}",${expense.is_recurring ? 'Yes' : 'No'}`
        ).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "expenses_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export Complete",
      description: "Expenses data has been downloaded as CSV",
    });
  };

  const exportToPDF = (expenses: Expense[]) => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('Expense Report', 20, 20);
    
    // Add generation date
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);
    
    // Calculate summary
    const totalAmount = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
    doc.text(`Total Expenses: UGX ${totalAmount.toLocaleString()}`, 20, 40);
    doc.text(`Number of Entries: ${expenses.length}`, 20, 50);
    
    // Prepare table data
    const tableData = expenses.map(expense => [
      expense.expense_date,
      expense.expense_categories?.name || '',
      `UGX ${Number(expense.amount).toLocaleString()}`,
      expense.payment_method.replace('_', ' '),
      expense.supplier_name || '',
      expense.description || '',
      expense.is_recurring ? 'Yes' : 'No'
    ]);
    
    // Add table
    doc.autoTable({
      head: [['Date', 'Category', 'Amount', 'Payment Method', 'Supplier', 'Description', 'Recurring']],
      body: tableData,
      startY: 60,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] }
    });
    
    doc.save('expenses_report.pdf');
    
    toast({
      title: "Export Complete",
      description: "Expenses report has been downloaded as PDF",
    });
  };

  const exportToWord = (expenses: Expense[]) => {
    // Create HTML content for Word document
    const totalAmount = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
    
    let htmlContent = `
      <html>
        <head>
          <meta charset="utf-8">
          <title>Expense Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #2563eb; }
            table { border-collapse: collapse; width: 100%; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .summary { background-color: #f8f9fa; padding: 15px; margin: 20px 0; border-radius: 5px; }
          </style>
        </head>
        <body>
          <h1>Expense Report</h1>
          <div class="summary">
            <p><strong>Generated on:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Total Expenses:</strong> UGX ${totalAmount.toLocaleString()}</p>
            <p><strong>Number of Entries:</strong> ${expenses.length}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Payment Method</th>
                <th>Supplier</th>
                <th>Description</th>
                <th>Recurring</th>
              </tr>
            </thead>
            <tbody>
    `;
    
    expenses.forEach(expense => {
      htmlContent += `
        <tr>
          <td>${expense.expense_date}</td>
          <td>${expense.expense_categories?.name || ''}</td>
          <td>UGX ${Number(expense.amount).toLocaleString()}</td>
          <td>${expense.payment_method.replace('_', ' ')}</td>
          <td>${expense.supplier_name || ''}</td>
          <td>${expense.description || ''}</td>
          <td>${expense.is_recurring ? 'Yes' : 'No'}</td>
        </tr>
      `;
    });
    
    htmlContent += `
            </tbody>
          </table>
        </body>
      </html>
    `;
    
    // Create blob and download
    const blob = new Blob([htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'expenses_report.doc';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Export Complete",
      description: "Expenses report has been downloaded as Word document",
    });
  };

  return {
    exportToCSV,
    exportToPDF,
    exportToWord
  };
};
