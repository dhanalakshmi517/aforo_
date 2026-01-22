import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./InvoicesPage.css";
import PageHeader from "../PageHeader/PageHeader";
import DataTable, { DataTableColumn } from "../componenetsss/DataTable";
import PrimaryButton from "../componenetsss/PrimaryButton";
import IntegrationButton from "../componenetsss/IntegrationButton";
import invoicesImage from "./invoices.svg";
import { getAuthHeaders } from "../../utils/auth";

type QuickBooksInvoice = {
  Id: string;
  DocNumber: string;
  TxnDate: string;
  TotalAmt: number;
  Balance: number;
  CustomerRef: {
    value: string;
    name: string;
  };
  DueDate: string;
  CurrencyRef: {
    value: string;
    name: string;
  };
  pdfUrl: string;
  pdfDownloadUrl: string;
  aforoInvoiceId: string;
  syncedAt: string;
};

type QuickBooksResponse = {
  invoices: QuickBooksInvoice[];
  maxResults: number;
  count: number;
  hasMore: boolean;
  startPosition: number;
};

type Invoice = {
  id: string;
  invoiceNumber: string;
  customer: string;
  amount: number;
  balance: number;
  generatedOn: string;
  dueDate: string;
  status: string;
  currency: string;
  pdfUrl: string;
  pdfDownloadUrl: string;
  aforoInvoiceId: string;
};

type Props = {
  onExploreIntegrations?: () => void;
};

const InvoicesPage: React.FC<Props> = ({ onExploreIntegrations }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const isEmpty = invoices.length === 0;

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(
        'http://44.204.127.27:8095/api/quickbooks/invoices',
        {
          method: 'GET',
          headers: getAuthHeaders({ contentType: 'json' }),
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: QuickBooksResponse = await response.json();
      console.log('Raw API Response:', data);
      
      if (!data.invoices || data.invoices.length === 0) {
        console.log('No invoices in response');
        setInvoices([]);
        return;
      }
      
      console.log('Number of invoices received:', data.invoices.length);
      
      const formattedInvoices: Invoice[] = data.invoices.map((invoice) => ({
        id: invoice.Id,
        invoiceNumber: invoice.DocNumber,
        customer: invoice.CustomerRef?.name || 'Unknown',
        amount: invoice.TotalAmt,
        balance: invoice.Balance,
        generatedOn: new Date(invoice.syncedAt).toLocaleDateString(),
        dueDate: new Date(invoice.DueDate).toLocaleDateString(),
        status: invoice.Balance === 0 ? 'Paid' : 'Pending',
        currency: invoice.CurrencyRef?.name || 'USD',
        pdfUrl: invoice.pdfUrl,
        pdfDownloadUrl: invoice.pdfDownloadUrl,
        aforoInvoiceId: invoice.aforoInvoiceId,
      }));
      
      console.log('Formatted invoices:', formattedInvoices);
      console.log('Setting invoices state with', formattedInvoices.length, 'invoices');
      setInvoices(formattedInvoices);
      console.log('Invoices state updated');
    } catch (err) {
      console.error('Error fetching invoices:', err);
      setError('Unable to fetch invoices. The server may be temporarily unavailable. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExploreIntegrations = () => {
    navigate('/get-started/invoices/quickbooks-preview');
  };

  const handlePrimaryClick = () => {
    navigate('/get-started/invoices/quickbooks-preview');
  };

  const handleRowClick = (invoice: Invoice) => {
    navigate(`/get-started/invoices/${invoice.id}`, { state: { invoice } });
  };

  // Define table columns
  const columns: DataTableColumn<Invoice>[] = [
    {
      key: "invoiceNumber",
      title: "Invoice Number",
      render: (row) => row.invoiceNumber,
    },
    {
      key: "customer",
      title: "Customer",
      render: (row) => row.customer,
    },
    {
      key: "amount",
      title: "Amount",
      render: (row) => `${row.currency} ${row.amount.toFixed(2)}`,
    },
    {
      key: "balance",
      title: "Balance",
      render: (row) => `${row.currency} ${row.balance.toFixed(2)}`,
    },
    {
      key: "generatedOn",
      title: "Generated On",
      render: (row) => row.generatedOn,
    },
    {
      key: "dueDate",
      title: "Due Date",
      render: (row) => row.dueDate,
    },
    {
      key: "status",
      title: "Status",
      render: (row) => (
        <span
          style={{
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: '500',
            backgroundColor: row.status === 'Paid' ? '#d1fae5' : '#fef3c7',
            color: row.status === 'Paid' ? '#065f46' : '#92400e',
          }}
        >
          {row.status}
        </span>
      ),
    },
    {
      key: "actions",
      title: "Actions",
      render: (row) => (
        <button
          onClick={() => window.open(row.pdfDownloadUrl, '_blank')}
          style={{
            padding: '4px 8px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            background: 'white',
            cursor: 'pointer',
            fontSize: '12px',
          }}
        >
          Download
        </button>
      ),
    },
  ];

  return (
    <div className="inv-page">
      {/* Header */}
      <PageHeader
        title="Invoices"
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        searchDisabled={isEmpty}
        showPrimary={true}
        showIntegrations={false}
        useIntegrationButton={true}
        onPrimaryClick={handlePrimaryClick}
        onSettingsClick={handleExploreIntegrations}
      />

      {/* Table */}
      <DataTable
        columns={columns}
        rows={invoices}
        rowKey={(row) => row.id}
        onRowClick={handleRowClick}
        emptyIcon={<img src={invoicesImage} alt="No invoices" width={169} height={169} />}
        emptyText={
          error && !error.toLowerCase().includes('cors')
            ? `Unable to fetch invoices: ${error}. Please try again later.`
            : invoices.length === 0 && !isLoading
              ? "No invoices found. Connect an integration to start generating invoices automatically and keep your billing in sync."
              : "Loading invoices..."
        }
        emptyAction={
          (!error || error.toLowerCase().includes('cors')) && !isLoading && invoices.length === 0 && (
            <PrimaryButton onClick={handleExploreIntegrations}>
              Explore Integrations
            </PrimaryButton>
          )
        }
      />
    </div>
  );
};

export default InvoicesPage;
