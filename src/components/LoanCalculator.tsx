import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Calculator } from "lucide-react";

const LoanCalculator = () => {
  const [loanAmount, setLoanAmount] = useState(100000);
  const [tenure, setTenure] = useState(12);
  const interestRate = 12; // Fixed 12% annual interest

  const calculateEMI = () => {
    const monthlyRate = interestRate / 12 / 100;
    const emi = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / 
                (Math.pow(1 + monthlyRate, tenure) - 1);
    return emi.toFixed(0);
  };

  return (
    <Card className="card-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Calculator className="h-5 w-5 text-primary" />
          Loan Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label htmlFor="amount">Loan Amount</Label>
            <span className="text-lg font-semibold text-primary">₹{loanAmount.toLocaleString('en-IN')}</span>
          </div>
          <Slider
            id="amount"
            min={10000}
            max={1000000}
            step={10000}
            value={[loanAmount]}
            onValueChange={(value) => setLoanAmount(value[0])}
            className="cursor-pointer"
          />
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label htmlFor="tenure">Tenure (Months)</Label>
            <span className="text-lg font-semibold text-primary">{tenure} months</span>
          </div>
          <Slider
            id="tenure"
            min={3}
            max={60}
            step={3}
            value={[tenure]}
            onValueChange={(value) => setTenure(value[0])}
            className="cursor-pointer"
          />
        </div>

        <div className="pt-4 border-t border-border">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Interest Rate</span>
            <span className="font-medium">{interestRate}% p.a.</span>
          </div>
          <div className="flex justify-between items-center mt-4">
            <span className="text-lg font-medium">Estimated Monthly Payment</span>
            <span className="text-2xl font-bold text-success">₹{calculateEMI()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoanCalculator;
