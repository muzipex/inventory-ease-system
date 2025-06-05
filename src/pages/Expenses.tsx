
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter, Edit, Trash2, Download, TrendingUp, Calendar, FileText, File, Users } from 'lucide-react';
import { useExpenses, Expense } from '@/hooks/useExpenses';
import { useToast } from '@/hooks/use-toast';
import ExpenseModal from '@/components/ExpenseModal';
import ExpenseQuickStats from '@/components/ExpenseQuickStats';
import DateRangePicker from '@/components/DateRangePicker';
import ExpenseAnalytics from '@/components/ExpenseAnalytics';
import { useExpenseExport } from '@/hooks/useExpenseExport';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { format, isWithinInterval } from 'date-fns';

const Expenses = () => {
  const { expenses, categories, loading, deleteExpense } = useExpenses();
  const { toast } = useToast();
  const { exportToCSV, exportToPDF, exportToWord } = useExpenseExport();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  // Filter expenses based on search, filters, and date range
  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = 
      expense.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.supplier_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.expense_categories?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !categoryFilter || categoryFilter === 'all_categories' || expense.category_id === categoryFilter;
    const matchesPaymentMethod = !paymentMethodFilter || paymentMethodFilter === 'all_payment_methods' || expense.payment_method === paymentMethodFilter;
    
    const matchesDateRange = !startDate || !endDate || isWithinInterval(
      new Date(expense.expense_date),
      { start: startDate, end: endDate }
    );
    
    return matchesSearch && matchesCategory && matchesPaymentMethod && matchesDateRange;
  });

  const handleEdit = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      await deleteExpense(id);
    }
  };

  const openModal = () => {
    setSelectedExpense(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedExpense(null);
  };

  const handleDateRangeChange = (start: Date | null, end: Date | null) => {
    setStartDate(start);
    setEndDate(end);
  };

  const handleQuickStatsClick = (type: string) => {
    setActiveTab('analytics');
    toast({
      title: "Analytics View",
      description: `Showing ${type} expense analytics`,
    });
  };

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setCategoryFilter(categoryId);
    setActiveTab('overview');
    toast({
      title: "Category Filter Applied",
      description: `Showing expenses for selected category`,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Loading expenses...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
          Expense Management
        </h1>
        <div className="flex space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center space-x-2">
                <Download className="h-4 w-4" />
                <span>Export</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => exportToCSV(filteredExpenses)}>
                <File className="h-4 w-4 mr-2" />
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportToPDF(filteredExpenses)}>
                <FileText className="h-4 w-4 mr-2" />
                Export as PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportToWord(filteredExpenses)}>
                <FileText className="h-4 w-4 mr-2" />
                Export as Word
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={openModal} className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Add Expense</span>
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <ExpenseQuickStats expenses={filteredExpenses} onCardClick={handleQuickStatsClick} />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Filters */}
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                    <Input
                      placeholder="Search expenses (description, supplier, employee, category)..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full lg:w-48">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_categories">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
                  <SelectTrigger className="w-full lg:w-48">
                    <SelectValue placeholder="All Payment Methods" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_payment_methods">All Payment Methods</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="credit_card">Credit Card</SelectItem>
                    <SelectItem value="mobile_money">Mobile Money</SelectItem>
                    <SelectItem value="check">Check</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col lg:flex-row gap-4 items-center">
                <DateRangePicker onDateRangeChange={handleDateRangeChange} />
                
                {(searchTerm || (categoryFilter && categoryFilter !== 'all_categories') || (paymentMethodFilter && paymentMethodFilter !== 'all_payment_methods') || startDate || endDate) && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('');
                      setCategoryFilter('');
                      setPaymentMethodFilter('');
                      setStartDate(null);
                      setEndDate(null);
                      setSelectedCategoryId(null);
                    }}
                    className="flex items-center space-x-2"
                  >
                    <Filter className="h-4 w-4" />
                    <span>Clear All</span>
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* Expenses Table */}
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExpenses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      No expenses found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredExpenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell>{format(new Date(expense.expense_date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>{expense.expense_categories?.name}</TableCell>
                      <TableCell className="font-medium">UGX {Number(expense.amount).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {expense.payment_method.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>{expense.supplier_name || '-'}</TableCell>
                      <TableCell>
                        {expense.employee_name ? (
                          <div className="flex items-center space-x-1">
                            <Users className="h-3 w-3 text-gray-500" />
                            <span className="text-sm">{expense.employee_name}</span>
                          </div>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{expense.description || '-'}</TableCell>
                      <TableCell>
                        {expense.is_recurring ? (
                          <Badge variant="secondary">Recurring</Badge>
                        ) : (
                          <Badge variant="outline">One-time</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(expense)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(expense.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <ExpenseAnalytics expenses={filteredExpenses} />
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Expense Categories</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => {
                const categoryExpenses = filteredExpenses.filter(
                  expense => expense.category_id === category.id
                );
                const total = categoryExpenses.reduce(
                  (sum, expense) => sum + Number(expense.amount), 0
                );
                
                return (
                  <Card 
                    key={category.id} 
                    className={`p-4 cursor-pointer transition-all hover:shadow-md hover:border-blue-300 ${
                      selectedCategoryId === category.id ? 'border-blue-500 bg-blue-50' : ''
                    }`}
                    onClick={() => handleCategoryClick(category.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-blue-600 hover:text-blue-700">{category.name}</h4>
                        <p className="text-sm text-gray-500 mt-1">{category.description}</p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="font-medium">UGX {total.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">{categoryExpenses.length} expenses</p>
                      </div>
                    </div>
                    <div className="mt-3 text-xs text-gray-400">
                      Click to filter expenses by this category
                    </div>
                  </Card>
                );
              })}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <ExpenseModal
        isOpen={isModalOpen}
        onClose={closeModal}
        expense={selectedExpense}
        categories={categories}
      />
    </div>
  );
};

export default Expenses;
