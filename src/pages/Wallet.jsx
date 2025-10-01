import React, { useState } from "react";

export default function Wallet() {
  const [balance, setBalance] = useState(500);
  const [transactions, setTransactions] = useState([
    { date: "2024-05-08", type: "Deposit", status: "Completed", amount: 100 },
    { date: "2024-05-01", type: "Withdraw", status: "Completed", amount: -50 },
  ]);

  const handleDeposit = () => {
    const amount = parseInt(prompt("Enter deposit amount"));
    if (amount && amount > 0) {
      setBalance(balance + amount);
      setTransactions([{ date: new Date().toISOString().split("T")[0], type: "Deposit", status: "Completed", amount }, ...transactions]);
    } else {
      alert("Invalid amount");
    }
  };

  const handleWithdraw = () => {
    const amount = parseInt(prompt("Enter withdraw amount"));
    if (amount && amount > 0 && amount <= balance) {
      setBalance(balance - amount);
      setTransactions([{ date: new Date().toISOString().split("T")[0], type: "Withdraw", status: "Completed", amount: -amount }, ...transactions]);
    } else {
      alert("Invalid amount or insufficient balance");
    }
  };

  return (
    <div className="page">
      <h1 className="page-title">Your Wallet</h1>
      <div className="wallet-balance">
        <div className="balance-label">Balance</div>
        <div className="balance-amount">{balance} TNC</div>
        <div className="wallet-actions">
          <button className="btn btn-primary" onClick={handleDeposit}>
            Deposit
          </button>
          <button className="btn btn-secondary" onClick={handleWithdraw}>
            Withdraw
          </button>
        </div>
      </div>

      <div className="transaction-history">
        <h3>Transaction History</h3>
        <table className="transaction-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Status</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t, index) => (
              <tr key={index}>
                <td>{t.date}</td>
                <td>{t.type}</td>
                <td><span className="status-completed">{t.status}</span></td>
                <td><span className={t.amount > 0 ? "amount-positive" : "amount-negative"}>{t.amount > 0 ? `+${t.amount}` : t.amount} TNC</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
