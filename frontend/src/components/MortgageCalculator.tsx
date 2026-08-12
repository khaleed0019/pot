'use client';

import { useState } from 'react';
import { Calculator, DollarSign, Percent, Calendar, RefreshCcw } from 'lucide-react';

const MortgageCalculator = () => {
  const [price, setPrice] = useState(1250000);
  const [downPayment, setDownPayment] = useState(250000);
  const [interestRate, setInterestRate] = useState(6.5);
  const [loanTerm, setLoanTerm] = useState(30);
  const [monthlyPayment, setMonthlyPayment] = useState<number | null>(null);

  const calculateMortgage = () => {
    const principal = price - downPayment;
    const monthlyRate = interestRate / 100 / 12;
    const numberOfPayments = loanTerm * 12;

    if (monthlyRate === 0) {
      setMonthlyPayment(principal / numberOfPayments);
      return;
    }

    const x = Math.pow(1 + monthlyRate, numberOfPayments);
    const monthly = (principal * x * monthlyRate) / (x - 1);
    setMonthlyPayment(monthly);
  };

  return (
    <div className="bg-white rounded-[40px] shadow-2xl p-10 border border-gray-100">
      <div className="flex items-center space-x-4 mb-10">
        <div className="bg-primary/10 p-3 rounded-2xl">
          <Calculator className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-2xl font-extrabold text-secondary">Mortgage Calculator</h3>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Property Price</label>
          <div className="relative">
            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input 
              type="number" 
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-primary/20 font-bold text-secondary"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Down Payment</label>
          <div className="relative">
            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input 
              type="number" 
              value={downPayment}
              onChange={(e) => setDownPayment(Number(e.target.value))}
              className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-primary/20 font-bold text-secondary"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Interest Rate (%)</label>
            <div className="relative">
              <Percent className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input 
                type="number" 
                step="0.1"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-primary/20 font-bold text-secondary"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Term (Years)</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input 
                type="number" 
                value={loanTerm}
                onChange={(e) => setLoanTerm(Number(e.target.value))}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-primary/20 font-bold text-secondary"
              />
            </div>
          </div>
        </div>

        <button 
          onClick={calculateMortgage}
          className="w-full bg-primary text-white py-5 rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all shadow-xl shadow-primary/30 flex items-center justify-center"
        >
          <RefreshCcw className="h-5 w-5 mr-2" />
          Calculate Payment
        </button>

        {monthlyPayment !== null && (
          <div className="mt-10 p-8 bg-blue-50 rounded-[32px] border border-blue-100 text-center animate-in zoom-in-95 duration-500">
            <p className="text-sm font-bold text-primary uppercase tracking-widest mb-2">Estimated Monthly Payment</p>
            <p className="text-5xl font-extrabold text-secondary">${Math.round(monthlyPayment).toLocaleString()}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MortgageCalculator;
