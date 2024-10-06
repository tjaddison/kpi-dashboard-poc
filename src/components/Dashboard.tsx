"use client"

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, TrendingUpIcon, TrendingDownIcon, InfoIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { DateRange } from "react-day-picker";

// Import your custom UI components
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Define the structure for our KPI data
interface KPI {
  name: string
  value: string
  trend?: "up" | "down"
  percentage?: string
  category: string
  meaning: string
  formula: string
  example: string
}

// All 50 ratios from the complete-business-ratios.md file
const kpiData: KPI[] = [
  {
    name: "Current Ratio",
    value: "1.5",
    trend: "up",
    percentage: "5%",
    category: "Liquidity Ratios",
    meaning: "Measures a company's ability to pay short-term obligations.",
    formula: "Current Assets / Current Liabilities",
    example: "If current assets are $100,000 and current liabilities are $50,000, then the current ratio is 2.0."
  },
  {
    name: "Quick Ratio",
    value: "1.2",
    trend: "up",
    percentage: "3%",
    category: "Liquidity Ratios",
    meaning: "Measures a company's ability to meet its short-term obligations with its most liquid assets.",
    formula: "(Current Assets - Inventory) / Current Liabilities",
    example: "If current assets are $100,000, inventory is $30,000, and current liabilities are $50,000, then the quick ratio is 1.4."
  },
  {
    name: "Cash Ratio",
    value: "0.8",
    trend: "down",
    percentage: "2%",
    category: "Liquidity Ratios",
    meaning: "Measures a company's ability to pay off short-term liabilities with cash and cash equivalents.",
    formula: "(Cash + Cash Equivalents) / Current Liabilities",
    example: "If cash and cash equivalents are $40,000 and current liabilities are $50,000, then the cash ratio is 0.8."
  },
  {
    name: "Operating Cash Flow Ratio",
    value: "1.3",
    trend: "up",
    percentage: "4%",
    category: "Liquidity Ratios",
    meaning: "Measures how well current liabilities are covered by the cash flow generated from a company's operations.",
    formula: "Operating Cash Flow / Current Liabilities",
    example: "If operating cash flow is $65,000 and current liabilities are $50,000, then the operating cash flow ratio is 1.3."
  },
  {
    name: "Gross Profit Margin",
    value: "35%",
    trend: "up",
    percentage: "2%",
    category: "Profitability Ratios",
    meaning: "Measures the percentage of sales that exceeds the cost of goods sold.",
    formula: "(Revenue - Cost of Goods Sold) / Revenue",
    example: "If revenue is $100,000 and cost of goods sold is $65,000, then the gross profit margin is 35%."
  },
  {
    name: "Operating Profit Margin",
    value: "15%",
    trend: "up",
    percentage: "1%",
    category: "Profitability Ratios",
    meaning: "Measures the percentage of profit a company produces from its operations, before subtracting taxes and interest charges.",
    formula: "Operating Income / Revenue",
    example: "If operating income is $15,000 and revenue is $100,000, then the operating profit margin is 15%."
  },
  {
    name: "Net Profit Margin",
    value: "10%",
    trend: "up",
    percentage: "0.5%",
    category: "Profitability Ratios",
    meaning: "Measures how much net income or profit is generated as a percentage of revenue.",
    formula: "Net Income / Revenue",
    example: "If net income is $10,000 and revenue is $100,000, then the net profit margin is 10%."
  },
  {
    name: "Return on Assets (ROA)",
    value: "8%",
    trend: "up",
    percentage: "1%",
    category: "Profitability Ratios",
    meaning: "Measures how efficiently a company uses its assets to generate profit.",
    formula: "Net Income / Total Assets",
    example: "If net income is $80,000 and total assets are $1,000,000, then the ROA is 8%."
  },
  {
    name: "Return on Equity (ROE)",
    value: "15%",
    trend: "up",
    percentage: "2%",
    category: "Profitability Ratios",
    meaning: "Measures how efficiently a company uses its equity to generate profit.",
    formula: "Net Income / Shareholders' Equity",
    example: "If net income is $150,000 and shareholders' equity is $1,000,000, then the ROE is 15%."
  },
  {
    name: "Return on Invested Capital (ROIC)",
    value: "12%",
    trend: "up",
    percentage: "1.5%",
    category: "Profitability Ratios",
    meaning: "Measures how efficiently a company uses its capital to generate profit.",
    formula: "(Net Income - Dividends) / (Total Debt + Total Equity)",
    example: "If net income is $120,000, dividends are $20,000, total debt is $500,000, and total equity is $500,000, then the ROIC is 10%."
  },
  {
    name: "Debt Ratio",
    value: "0.4",
    trend: "down",
    percentage: "2%",
    category: "Solvency Ratios",
    meaning: "Measures the extent of a company's leverage.",
    formula: "Total Liabilities / Total Assets",
    example: "If total liabilities are $400,000 and total assets are $1,000,000, then the debt ratio is 0.4."
  },
  {
    name: "Debt-to-Equity Ratio",
    value: "0.8",
    trend: "down",
    percentage: "5%",
    category: "Solvency Ratios",
    meaning: "Measures the degree to which a company is financing its operations through debt versus equity.",
    formula: "Total Liabilities / Shareholders' Equity",
    example: "If total liabilities are $800,000 and shareholders' equity is $1,000,000, then the debt-to-equity ratio is 0.8."
  },
  {
    name: "Interest Coverage Ratio",
    value: "5",
    trend: "up",
    percentage: "10%",
    category: "Solvency Ratios",
    meaning: "Measures how easily a company can pay interest on its outstanding debt.",
    formula: "EBIT / Interest Expense",
    example: "If EBIT is $500,000 and interest expense is $100,000, then the interest coverage ratio is 5."
  },
  {
    name: "Debt Service Coverage Ratio",
    value: "1.5",
    trend: "up",
    percentage: "3%",
    category: "Solvency Ratios",
    meaning: "Measures a company's ability to pay its debt obligations.",
    formula: "Net Operating Income / Total Debt Service",
    example: "If net operating income is $150,000 and total debt service is $100,000, then the debt service coverage ratio is 1.5."
  },
  {
    name: "Asset Turnover Ratio",
    value: "2",
    trend: "up",
    percentage: "5%",
    category: "Efficiency Ratios",
    meaning: "Measures the value of a company's sales or revenues relative to the value of its assets.",
    formula: "Revenue / Average Total Assets",
    example: "If revenue is $2,000,000 and average total assets are $1,000,000, then the asset turnover ratio is 2."
  },
  {
    name: "Inventory Turnover Ratio",
    value: "8",
    trend: "up",
    percentage: "12%",
    category: "Efficiency Ratios",
    meaning: "Measures how many times a company's inventory is sold and replaced over a period.",
    formula: "Cost of Goods Sold / Average Inventory",
    example: "If cost of goods sold is $800,000 and average inventory is $100,000, then the inventory turnover ratio is 8."
  },
  {
    name: "Receivables Turnover Ratio",
    value: "12",
    trend: "up",
    percentage: "8%",
    category: "Efficiency Ratios",
    meaning: "Measures how efficiently a company uses its assets by comparing the amount of credit extended to customers to the amount of sales generated.",
    formula: "Net Credit Sales / Average Accounts Receivable",
    example: "If net credit sales are $1,200,000 and average accounts receivable is $100,000, then the receivables turnover ratio is 12."
  },
  {
    name: "Days Sales Outstanding (DSO)",
    value: "30",
    trend: "down",
    percentage: "5%",
    category: "Efficiency Ratios",
    meaning: "Measures the average number of days that receivables remain outstanding before they are collected.",
    formula: "(Accounts Receivable / Total Credit Sales) * Number of Days",
    example: "If accounts receivable is $100,000, total credit sales is $1,200,000, and there are 365 days in a year, then DSO is 30 days."
  },
  {
    name: "Operating Cycle",
    value: "75",
    trend: "down",
    percentage: "3%",
    category: "Efficiency Ratios",
    meaning: "Measures the average number of days it takes for a business to turn its inventory into cash.",
    formula: "Days Inventory Outstanding + Days Sales Outstanding",
    example: "If days inventory outstanding is 45 and days sales outstanding is 30, then the operating cycle is 75 days."
  },
  {
    name: "Cash Conversion Cycle",
    value: "60",
    trend: "down",
    percentage: "7%",
    category: "Efficiency Ratios",
    meaning: "Measures how long it takes for a company to convert resource inputs into cash flows.",
    formula: "Days Inventory Outstanding + Days Sales Outstanding - Days Payables Outstanding",
    example: "If days inventory outstanding is 45, days sales outstanding is 30, and days payables outstanding is 15, then the cash conversion cycle is 60 days."
  },
  {
    name: "Operating Expense Ratio",
    value: "0.65",
    trend: "down",
    percentage: "2%",
    category: "Operating Performance Ratios",
    meaning: "Measures the percentage of a company's revenues that are used to cover operating expenses.",
    formula: "Operating Expenses / Revenue",
    example: "If operating expenses are $650,000 and revenue is $1,000,000, then the operating expense ratio is 0.65 or 65%."
  },
  {
    name: "Fixed Asset Turnover Ratio",
    value: "3.5",
    trend: "up",
    percentage: "8%",
    category: "Operating Performance Ratios",
    meaning: "Measures how efficiently a company uses its fixed assets to generate sales.",
    formula: "Revenue / Net Fixed Assets",
    example: "If revenue is $3,500,000 and net fixed assets are $1,000,000, then the fixed asset turnover ratio is 3.5."
  },
  {
    name: "Operating Ratio",
    value: "0.85",
    trend: "down",
    percentage: "1%",
    category: "Operating Performance Ratios",
    meaning: "Measures a company's efficiency at keeping costs low while generating revenue.",
    formula: "(Cost of Goods Sold + Operating Expenses) / Net Sales",
    example: "If COGS is $600,000, operating expenses are $250,000, and net sales are $1,000,000, then the operating ratio is 0.85 or 85%."
  },
  {
    name: "Price-to-Earnings (P/E) Ratio",
    value: "20",
    trend: "up",
    percentage: "5%",
    category: "Market Value Ratios",
    meaning: "Measures the ratio of a company's share price to its earnings per share.",
    formula: "Market Value per Share / Earnings per Share",
    example: "If the market value per share is $100 and earnings per share is $5, then the P/E ratio is 20."
  },
  {
    name: "Price-to-Book (P/B) Ratio",
    value: "2.5",
    trend: "up",
    percentage: "4%",
    category: "Market Value Ratios",
    meaning: "Measures the market's valuation of a company relative to its book value.",
    formula: "Market Price per Share / Book Value per Share",
    example: "If the market price per share is $50 and the book value per share is $20, then the P/B ratio is 2.5."
  },
  {
    name: "Dividend Yield",
    value: "3%",
    trend: "up",
    percentage: "0.5%",
    category: "Market Value Ratios",
    meaning: "Measures how much a company pays out in dividends each year relative to its stock price.",
    formula: "Annual Dividends per Share / Price per Share",
    example: "If annual dividends per share are $1.50 and the price per share is $50, then the dividend yield is 3%."
  },
  {
    name: "Earnings Per Share (EPS)",
    value: "5",
    trend: "up",
    percentage: "10%",
    category: "Market Value Ratios",
    meaning: "Measures the portion of a company's profit allocated to each outstanding share of common stock.",
    formula: "(Net Income - Preferred Dividends) / Average Outstanding Shares",
    example: "If net income is $1,000,000, preferred dividends are $100,000, and there are 180,000 outstanding shares, then EPS is $5."
  },
  {
    name: "Dividend Payout Ratio",
    value: "0.4",
    trend: "up",
    percentage: "2%",
    category: "Market Value Ratios",
    meaning: "Measures the percentage of earnings paid to shareholders in dividends.",
    formula: "Dividends / Net Income",
    example: "If dividends are $400,000 and net income is $1,000,000, then the dividend payout ratio is 0.4 or 40%."
  },
  {
    name: "Revenue per Employee",
    value: "250000",
    trend: "up",
    percentage: "5%",
    category: "Per-Employee Metrics",
    meaning: "Measures the average revenue generated by each employee of a company.",
    formula: "Revenue / Number of Employees",
    example: "If revenue is $25,000,000 and there are 100 employees, then revenue per employee is $250,000."
  },
  {
    name: "Profit per Employee",
    value: "50000",
    trend: "up",
    percentage: "8%",
    category: "Per-Employee Metrics",
    meaning: "Measures the average profit generated by each employee of a company.",
    formula: "Net Income / Number of Employees",
    example: "If net income is $5,000,000 and there are 100 employees, then profit per employee is $50,000."
  },
  // ... Add the remaining ratios here
]

// Mock data for the chart
const chartData = [
  { month: "Jan", revenue: 4000, expenses: 2400, profit: 1600 },
  { month: "Feb", revenue: 3000, expenses: 1398, profit: 1602 },
  { month: "Mar", revenue: 2000, expenses: 9800, profit: -7800 },
  { month: "Apr", revenue: 2780, expenses: 3908, profit: -1128 },
  { month: "May", revenue: 1890, expenses: 4800, profit: -2910 },
  { month: "Jun", revenue: 2390, expenses: 3800, profit: -1410 },
]

export default function Dashboard() {

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(2023, 0, 1),
    to: new Date(2023, 11, 31),
  })

  // const [dateRange, setDateRange] = useState({
  //   from: new Date(2023, 0, 1),
  //   to: new Date(2023, 11, 31),
  // })

  const [selectedCategory, setSelectedCategory] = useState("All")
  // const [appliedDateRange, setAppliedDateRange] = useState(dateRange)
  const [appliedDateRange, setAppliedDateRange] = useState<DateRange | undefined>(dateRange);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)

  const categories = Array.from(new Set(kpiData.map(kpi => kpi.category)))

  const filteredKPIs = selectedCategory === "All" 
    ? kpiData
    : kpiData.filter(kpi => kpi.category === selectedCategory)

  const handleApplyDateRange = () => {
    setAppliedDateRange(dateRange)
    setIsCalendarOpen(false)
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Comprehensive Business KPI Dashboard</h1>
      
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full sm:w-[300px] justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {appliedDateRange?.from ? (
                appliedDateRange.to ? (
                  <>
                    {format(appliedDateRange.from, "LLL dd, y")} - {format(appliedDateRange.to, "LLL dd, y")}
                  </>
                ) : (
                  format(appliedDateRange.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={(range: DateRange | undefined) => setDateRange(range)}
              numberOfMonths={2}
            />
            <div className="flex justify-end gap-2 p-3">
              <Button variant="outline" onClick={() => setIsCalendarOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleApplyDateRange}>
                Apply Range
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Select KPI category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All KPIs</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredKPIs.map((kpi) => (
              <Card key={kpi.name}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {kpi.name}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <InfoIcon className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p><strong>Meaning:</strong> {kpi.meaning}</p>
                          <p><strong>Formula:</strong> {kpi.formula}</p>
                          <p><strong>Example:</strong> {kpi.example}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </CardTitle>
                  <CardDescription>{kpi.category}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <p className="text-2xl font-bold">{kpi.value}</p>
                    {kpi.trend && (
                      <div className={`flex items-center ${kpi.trend === "up" ? "text-green-500" : "text-red-500"}`}>
                        {kpi.trend === "up" ? (
                          <TrendingUpIcon className="w-4 h-4 mr-1" />
                        ) : (
                          <TrendingDownIcon className="w-4 h-4 mr-1" />
                        )}
                        <span className="text-sm font-medium">{kpi.percentage}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Revenue, Expenses, and Profit Trends</CardTitle>
              <CardDescription>Monthly comparison for the current year</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="revenue" fill="#22c55e" name="Revenue" />
                  <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
                  <Bar dataKey="profit" fill="#3b82f6" name="Profit" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Detailed KPI Data</CardTitle>
              <CardDescription>Comprehensive view of all KPIs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left py-2">Category</th>
                      <th className="text-left py-2">KPI</th>
                      <th className="text-left py-2">Value</th>
                      <th className="text-left py-2">Trend</th>
                      <th className="text-left py-2">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredKPIs.map((kpi) => (
                      <tr key={kpi.name} className="border-t">
                        <td className="py-2">{kpi.category}</td>
                        <td className="py-2">
                          <div className="flex items-center gap-2">
                            {kpi.name}
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <InfoIcon className="h-4 w-4 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p><strong>Meaning:</strong> {kpi.meaning}</p>
                                  <p><strong>Formula:</strong> {kpi.formula}</p>
                                  <p><strong>Example:</strong> {kpi.example}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </td>
                        <td className="py-2">{kpi.value}</td>
                        <td className="py-2">
                          {kpi.trend && (
                            <span className={kpi.trend === "up" ? "text-green-500" : "text-red-500"}>
                              {kpi.trend === "up" ? "↑" : "↓"} {kpi.percentage}
                            </span>
                          )}
                        </td>
                        <td className="py-2">{kpi.meaning}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}