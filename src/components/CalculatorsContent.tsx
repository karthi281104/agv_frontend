import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Calculator, 
  Coins, 
  TrendingUp, 
  ArrowUpDown,
  Target,
  BarChart3,
  Activity
} from 'lucide-react';

const CalculatorsContent = () => {
  // Helpers
  const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);
  const percentOf = (num: number, denom: number) => (denom > 0 ? Math.round((num / denom) * 100) : 0);

  // EMI Calculator State
  const [emiAmount, setEmiAmount] = useState(500000);
  const [emiRate, setEmiRate] = useState(12);
  const [emiTenure, setEmiTenure] = useState(36);

  // Gold Loan Calculator State
  const [goldWeight, setGoldWeight] = useState(100);
  const [goldPurity, setGoldPurity] = useState(22);
  const [goldRate, setGoldRate] = useState(6800);
  const [loanToValue, setLoanToValue] = useState(75);

  // Gold Conversion State
  const [conversionType, setConversionType] = useState('carat-to-percentage');
  const [caratValue, setCaratValue] = useState(22);
  const [percentageValue, setPercentageValue] = useState(91.6);

  // Interest Calculator State
  const [principal, setPrincipal] = useState(100000);
  const [interestRate, setInterestRate] = useState(12);
  const [timePeriod, setTimePeriod] = useState(12);
  const [interestType, setInterestType] = useState<'simple' | 'compound'>('simple');

  // Eligibility Calculator State
  const [monthlyIncome, setMonthlyIncome] = useState(50000);
  const [existingEmi, setExistingEmi] = useState(5000);
  const [creditScore, setCreditScore] = useState(750);

  // EMI Calculations
  const emiCalculations = useMemo(() => {
    if (emiAmount <= 0 || emiRate <= 0 || emiTenure <= 0) {
      return { emi: 0, totalAmount: 0, totalInterest: 0 };
    }
    const monthlyRate = emiRate / 100 / 12;
    const emi = (emiAmount * monthlyRate * Math.pow(1 + monthlyRate, emiTenure)) /
      (Math.pow(1 + monthlyRate, emiTenure) - 1);
    const totalAmount = emi * emiTenure;
    const totalInterest = totalAmount - emiAmount;
    return {
      emi: Math.round(emi),
      totalAmount: Math.round(totalAmount),
      totalInterest: Math.round(totalInterest)
    };
  }, [emiAmount, emiRate, emiTenure]);

  // Gold Loan Calculations
  const goldLoanCalculations = useMemo(() => {
    const goldValue = goldWeight * (goldPurity / 24) * goldRate;
    const maxLoanAmount = (goldValue * loanToValue) / 100;
    const marketValue = goldWeight * goldRate;
    return {
      goldValue: Math.round(goldValue),
      maxLoanAmount: Math.round(maxLoanAmount),
      marketValue: Math.round(marketValue),
      purityPercentage: Math.round((goldPurity / 24) * 100 * 100) / 100
    };
  }, [goldWeight, goldPurity, goldRate, loanToValue]);

  // Gold Conversion Calculations
  const goldConversion = useMemo(() => {
    if (conversionType === 'carat-to-percentage') {
      const percentage = (caratValue / 24) * 100;
      return { result: Math.round(percentage * 100) / 100, unit: '%' };
    } else {
      const carat = (percentageValue * 24) / 100;
      return { result: Math.round(carat * 100) / 100, unit: 'K' };
    }
  }, [conversionType, caratValue, percentageValue]);

  // Interest Calculations
  const interestCalculations = useMemo(() => {
    if (principal <= 0 || interestRate <= 0 || timePeriod <= 0) {
      return { interest: 0, totalAmount: 0 };
    }
    let interest: number;
    if (interestType === 'simple') {
      interest = (principal * interestRate * (timePeriod / 12)) / 100;
    } else {
      const compoundFactor = Math.pow(1 + interestRate / 100 / 12, timePeriod);
      interest = principal * compoundFactor - principal;
    }
    return { interest: Math.round(interest), totalAmount: Math.round(principal + interest) };
  }, [principal, interestRate, timePeriod, interestType]);

  // Eligibility Calculations
  const eligibilityCalculations = useMemo(() => {
    const disposableIncome = Math.max(0, monthlyIncome - existingEmi);
    const maxEmi = disposableIncome * 0.5; // 50%
    const creditMultiplier = creditScore >= 750 ? 1.2 : creditScore >= 650 ? 1.0 : 0.8;
    const eligibleAmount = maxEmi * 60 * creditMultiplier; // 60 months assumed
    const baseIncome = monthlyIncome > 0 ? monthlyIncome : 1;
    const eligibilityScore = Math.min(100,
      (disposableIncome / baseIncome * 40) +
      (creditScore / 850 * 40) +
      (monthlyIncome >= 30000 ? 20 : monthlyIncome >= 20000 ? 10 : 0)
    );
    return {
      maxEmi: Math.round(maxEmi),
      eligibleAmount: Math.round(eligibleAmount),
      eligibilityScore: Math.round(eligibilityScore),
      disposableIncome: Math.round(disposableIncome)
    };
  }, [monthlyIncome, existingEmi, creditScore]);

  return (
    <div className="relative z-10 p-4 sm:p-6 lg:p-8">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Loan Calculators
        </h1>
        <p className="text-gray-600 mt-2">Comprehensive financial calculators for informed loan decisions</p>
      </div>

      <Tabs defaultValue="emi" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 h-auto p-1">
          <TabsTrigger value="emi" className="flex flex-col items-center gap-1 p-3 text-xs sm:text-sm">
            <Calculator className="h-4 w-4" />
            EMI
          </TabsTrigger>
          <TabsTrigger value="gold" className="flex flex-col items-center gap-1 p-3 text-xs sm:text-sm">
            <Coins className="h-4 w-4" />
            Gold Loan
          </TabsTrigger>
          <TabsTrigger value="conversion" className="flex flex-col items-center gap-1 p-3 text-xs sm:text-sm">
            <ArrowUpDown className="h-4 w-4" />
            Conversion
          </TabsTrigger>
          <TabsTrigger value="interest" className="flex flex-col items-center gap-1 p-3 text-xs sm:text-sm">
            <TrendingUp className="h-4 w-4" />
            Interest
          </TabsTrigger>
          <TabsTrigger value="eligibility" className="flex flex-col items-center gap-1 p-3 text-xs sm:text-sm">
            <Target className="h-4 w-4" />
            Eligibility
          </TabsTrigger>
          <TabsTrigger value="comparison" className="flex flex-col items-center gap-1 p-3 text-xs sm:text-sm">
            <BarChart3 className="h-4 w-4" />
            Compare
          </TabsTrigger>
        </TabsList>

        {/* EMI Calculator */}
        <TabsContent value="emi">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="card-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-primary" />
                  EMI Calculator
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <Label>Loan Amount</Label>
                      <span className="font-semibold text-primary">₹{emiAmount.toLocaleString()}</span>
                    </div>
                    <Slider value={[emiAmount]} onValueChange={(v) => setEmiAmount(clamp(Number(v[0]), 50000, 10000000))} max={10000000} min={50000} step={10000} className="cursor-pointer" />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>₹50K</span>
                      <span>₹1Cr</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <Label>Interest Rate (% p.a.)</Label>
                      <span className="font-semibold text-primary">{emiRate}%</span>
                    </div>
                    <Slider value={[emiRate]} onValueChange={(v) => setEmiRate(clamp(Number(v[0]), 5, 30))} max={30} min={5} step={0.1} className="cursor-pointer" />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>5%</span>
                      <span>30%</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <Label>Tenure (months)</Label>
                      <span className="font-semibold text-primary">{emiTenure} months</span>
                    </div>
                    <Slider value={[emiTenure]} onValueChange={(v) => setEmiTenure(clamp(Number(v[0]), 6, 360))} max={360} min={6} step={6} className="cursor-pointer" />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>6 months</span>
                      <span>30 years</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-shadow">
              <CardHeader>
                <CardTitle>EMI Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Monthly EMI</div>
                    <div className="text-3xl font-bold text-blue-600">₹{emiCalculations.emi.toLocaleString()}</div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Principal Amount</span>
                      <span className="font-semibold">₹{emiAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Interest</span>
                      <span className="font-semibold text-orange-600">₹{emiCalculations.totalInterest.toLocaleString()}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center text-lg">
                      <span className="font-semibold">Total Amount</span>
                      <span className="font-bold text-primary">₹{emiCalculations.totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="mt-6">
                    <div className="text-sm font-medium mb-3">Payment Breakdown</div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-blue-500 rounded"></div>
                          <span>Principal ({percentOf(emiAmount, emiCalculations.totalAmount)}%)</span>
                        </div>
                        <span>₹{emiAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-orange-500 rounded"></div>
                          <span>Interest ({percentOf(emiCalculations.totalInterest, emiCalculations.totalAmount)}%)</span>
                        </div>
                        <span>₹{emiCalculations.totalInterest.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="mt-3">
                      <Progress value={percentOf(emiAmount, emiCalculations.totalAmount)} className="h-2" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Gold Loan Calculator */}
        <TabsContent value="gold">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="card-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Coins className="h-5 w-5 text-amber-500" />
                  Gold Loan Calculator
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="goldWeight">Gold Weight (grams)</Label>
                    <Input id="goldWeight" type="number" value={goldWeight} onChange={(e) => {
                      const v = Number(e.target.value);
                      setGoldWeight(Number.isFinite(v) ? clamp(v, 0.01, 10000) : 0);
                    }} min="0.01" max="10000" step="0.01" />
                  </div>
                  <div>
                    <Label htmlFor="goldPurity">Gold Purity (Karat)</Label>
                    <Select value={goldPurity.toString()} onValueChange={(value) => setGoldPurity(clamp(Number(value), 10, 24))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="24">24K (99.9% Pure)</SelectItem>
                        <SelectItem value="22">22K (91.6% Pure)</SelectItem>
                        <SelectItem value="20">20K (83.3% Pure)</SelectItem>
                        <SelectItem value="18">18K (75.0% Pure)</SelectItem>
                        <SelectItem value="16">16K (66.7% Pure)</SelectItem>
                        <SelectItem value="14">14K (58.3% Pure)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="goldRate">Current Gold Rate (₹/gram)</Label>
                    <Input id="goldRate" type="number" value={goldRate} onChange={(e) => {
                      const v = Number(e.target.value);
                      setGoldRate(Number.isFinite(v) ? clamp(v, 100, 200000) : 0);
                    }} min="1000" max="20000" step="1" />
                  </div>
                  <div>
                    <Label>Loan-to-Value Ratio (%)</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Slider value={[loanToValue]} onValueChange={(v) => setLoanToValue(clamp(Number(v[0]), 50, 90))} max={90} min={50} step={5} className="flex-1 cursor-pointer" />
                      <span className="font-semibold text-primary w-12">{loanToValue}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-shadow">
              <CardHeader>
                <CardTitle>Gold Loan Assessment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Maximum Loan Amount</div>
                    <div className="text-3xl font-bold text-amber-600">₹{goldLoanCalculations.maxLoanAmount.toLocaleString()}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-600 mb-1">Gold Value</div>
                      <div className="text-lg font-bold">₹{goldLoanCalculations.goldValue.toLocaleString()}</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-600 mb-1">Market Value</div>
                      <div className="text-lg font-bold">₹{goldLoanCalculations.marketValue.toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center"><span className="text-gray-600">Gold Weight</span><span className="font-semibold">{goldWeight} grams</span></div>
                    <div className="flex justify-between items-center"><span className="text-gray-600">Purity</span><span className="font-semibold">{goldPurity}K ({goldLoanCalculations.purityPercentage}%)</span></div>
                    <div className="flex justify-between items-center"><span className="text-gray-600">Current Rate</span><span className="font-semibold">₹{goldRate}/gram</span></div>
                    <div className="flex justify-between items-center"><span className="text-gray-600">LTV Ratio</span><span className="font-semibold">{loanToValue}%</span></div>
                  </div>
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <div className="text-xs text-blue-600 font-medium mb-1">💡 Tip</div>
                    <div className="text-xs text-blue-800">Higher purity gold gets better loan amounts. Consider consolidating smaller gold items for better rates.</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Gold Conversion Calculator */}
        <TabsContent value="conversion">
          <div className="max-w-2xl mx-auto">
            <Card className="card-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowUpDown className="h-5 w-5 text-primary" />
                  Gold Purity Converter
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Conversion Type</Label>
                  <Select value={conversionType} onValueChange={setConversionType}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="carat-to-percentage">Karat to Percentage</SelectItem>
                      <SelectItem value="percentage-to-carat">Percentage to Karat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {conversionType === 'carat-to-percentage' ? (
                  <div>
                    <Label htmlFor="caratInput">Enter Karat Value</Label>
                    <Input id="caratInput" type="number" value={caratValue} onChange={(e) => setCaratValue(Number(e.target.value) || 0)} min="1" max="24" step="0.1" className="mt-1" />
                  </div>
                ) : (
                  <div>
                    <Label htmlFor="percentageInput">Enter Percentage Value</Label>
                    <Input id="percentageInput" type="number" value={percentageValue} onChange={(e) => setPercentageValue(Number(e.target.value) || 0)} min="1" max="100" step="0.1" className="mt-1" />
                  </div>
                )}
                <div className="text-center p-8 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-2">Converted Value</div>
                  <div className="text-4xl font-bold text-amber-600">{goldConversion.result}{goldConversion.unit}</div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-3">Quick Reference</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[{ karat: 24, percentage: 99.9 },{ karat: 22, percentage: 91.6 },{ karat: 20, percentage: 83.3 },{ karat: 18, percentage: 75.0 },{ karat: 16, percentage: 66.7 },{ karat: 14, percentage: 58.3 },{ karat: 12, percentage: 50.0 },{ karat: 10, percentage: 41.7 }].map((item) => (
                      <div key={item.karat} className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="font-semibold text-amber-600">{item.karat}K</div>
                        <div className="text-sm text-gray-600">{item.percentage}%</div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Interest Calculator */}
        <TabsContent value="interest">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="card-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Interest Calculator
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="principal">Principal Amount (₹)</Label>
                    <Input id="principal" type="number" value={principal} onChange={(e) => {
                      const v = Number(e.target.value);
                      setPrincipal(Number.isFinite(v) ? clamp(v, 1000, 10000000) : 0);
                    }} min="1000" max="10000000" step="1000" />
                  </div>
                  <div>
                    <Label htmlFor="interestRate">Interest Rate (% p.a.)</Label>
                    <Input id="interestRate" type="number" value={interestRate} onChange={(e) => {
                      const v = Number(e.target.value);
                      setInterestRate(Number.isFinite(v) ? clamp(v, 0.1, 50) : 0);
                    }} min="0.1" max="50" step="0.1" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="timePeriod">Time Period (months)</Label>
                    <Input id="timePeriod" type="number" value={timePeriod} onChange={(e) => {
                      const v = Number(e.target.value);
                      setTimePeriod(Number.isFinite(v) ? clamp(v, 1, 360) : 0);
                    }} min="1" max="360" step="1" />
                  </div>
                  <div>
                    <Label>Interest Type</Label>
                    <Select value={interestType} onValueChange={(v: 'simple' | 'compound') => setInterestType(v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="simple">Simple Interest</SelectItem>
                        <SelectItem value="compound">Compound Interest</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-shadow">
              <CardHeader>
                <CardTitle>Interest Calculation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">{interestType === 'simple' ? 'Simple' : 'Compound'} Interest</div>
                    <div className="text-3xl font-bold text-green-600">₹{interestCalculations.interest.toLocaleString()}</div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center"><span className="text-gray-600">Principal Amount</span><span className="font-semibold">₹{principal.toLocaleString()}</span></div>
                    <div className="flex justify-between items-center"><span className="text-gray-600">Interest Rate</span><span className="font-semibold">{interestRate}% p.a.</span></div>
                    <div className="flex justify-between items-center"><span className="text-gray-600">Time Period</span><span className="font-semibold">{timePeriod} months</span></div>
                    <div className="flex justify-between items-center"><span className="text-gray-600">Interest Type</span><Badge variant="outline">{interestType === 'simple' ? 'Simple' : 'Compound'}</Badge></div>
                    <Separator />
                    <div className="flex justify-between items-center text-lg"><span className="font-semibold">Total Amount</span><span className="font-bold text-primary">₹{interestCalculations.totalAmount.toLocaleString()}</span></div>
                  </div>
                  <div className="mt-4 p-3 bg-amber-50 rounded-lg">
                    <div className="text-xs text-amber-600 font-medium mb-1">ℹ️ Note</div>
                    <div className="text-xs text-amber-800">{interestType === 'simple' ? 'Simple interest is calculated on the principal amount only.' : 'Compound interest is calculated on the principal plus accumulated interest.'}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Loan Eligibility Calculator */}
        <TabsContent value="eligibility">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="card-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-500" />
                  Loan Eligibility Calculator
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="monthlyIncome">Monthly Income (₹)</Label>
                  <Input id="monthlyIncome" type="number" value={monthlyIncome} onChange={(e) => {
                    const v = Number(e.target.value);
                    setMonthlyIncome(Number.isFinite(v) ? clamp(v, 0, 100000000) : 0);
                  }} min="10000" max="1000000" step="1000" />
                </div>
                <div>
                  <Label htmlFor="existingEmi">Existing EMIs (₹)</Label>
                  <Input id="existingEmi" type="number" value={existingEmi} onChange={(e) => {
                    const v = Number(e.target.value);
                    setExistingEmi(Number.isFinite(v) ? clamp(v, 0, 100000000) : 0);
                  }} min="0" max="500000" step="500" />
                </div>
                <div>
                  <Label>Credit Score</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Slider value={[creditScore]} onValueChange={(v) => setCreditScore(Number(v[0]))} max={850} min={300} step={10} className="flex-1 cursor-pointer" />
                    <span className="font-semibold text-primary w-16">{creditScore}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1"><span>Poor (300)</span><span>Excellent (850)</span></div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-shadow">
              <CardHeader>
                <CardTitle>Eligibility Assessment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-2">Eligibility Score</div>
                    <div className="relative w-36 h-36 mx-auto">
                      <div className="w-36 h-36 rounded-full mx-auto" style={{ background: `conic-gradient(hsl(var(--primary)) ${eligibilityCalculations.eligibilityScore}%, #e5e7eb 0)` }}>
                        <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-primary">{eligibilityCalculations.eligibilityScore}</div>
                            <div className="text-xs text-gray-600">out of 100</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg"><div className="text-xs text-gray-600 mb-1">Max EMI</div><div className="text-lg font-bold text-blue-600">₹{eligibilityCalculations.maxEmi.toLocaleString()}</div></div>
                    <div className="text-center p-4 bg-green-50 rounded-lg"><div className="text-xs text-gray-600 mb-1">Eligible Amount</div><div className="text-lg font-bold text-green-600">₹{eligibilityCalculations.eligibleAmount.toLocaleString()}</div></div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center"><span className="text-gray-600">Monthly Income</span><span className="font-semibold">₹{monthlyIncome.toLocaleString()}</span></div>
                    <div className="flex justify-between items-center"><span className="text-gray-600">Existing EMIs</span><span className="font-semibold">₹{existingEmi.toLocaleString()}</span></div>
                    <div className="flex justify-between items-center"><span className="text-gray-600">Disposable Income</span><span className="font-semibold text-green-600">₹{eligibilityCalculations.disposableIncome.toLocaleString()}</span></div>
                    <div className="flex justify-between items-center"><span className="text-gray-600">Credit Score</span><Badge variant={creditScore >= 750 ? 'default' : creditScore >= 650 ? 'secondary' : 'destructive'}>{creditScore >= 750 ? 'Excellent' : creditScore >= 650 ? 'Good' : 'Fair'}</Badge></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Loan Comparison Placeholder */}
        <TabsContent value="comparison">
          <Card className="card-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-purple-500" />
                Loan Comparison Tool
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Activity className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">Coming Soon</h3>
                <p className="text-gray-500 max-w-md mx-auto">Compare different loan options side by side with detailed analysis of terms, interest rates, and total costs.</p>
                <Button className="mt-4" variant="outline">Get Notified</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CalculatorsContent;
