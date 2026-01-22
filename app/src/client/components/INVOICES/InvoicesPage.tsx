import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./InvoicesPage.css";
import PageHeader from "../PageHeader/PageHeader";
import DataTable, { DataTableColumn } from "../componenetsss/DataTable";
import PrimaryButton from "../componenetsss/PrimaryButton";
import IntegrationButton from "../componenetsss/IntegrationButton";
import StatusBadge from "../componenetsss/StatusBadge";
import invoicesImage from "./invoices.svg";
import noSearchImage from "./nosearch.svg";
import { getAuthHeaders, getOrganizationId } from "../../utils/auth";

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
  const [allInvoices, setAllInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const hasNoInvoices = allInvoices.length === 0;

  useEffect(() => {
    fetchInvoices();
  }, []);

  useEffect(() => {
    // Filter invoices based on search term
    if (!searchTerm.trim()) {
      setInvoices(allInvoices);
    } else {
      const filtered = allInvoices.filter(invoice => 
        invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.currency.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setInvoices(filtered);
    }
  }, [searchTerm, allInvoices]);

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
        generatedOn: new Date(invoice.syncedAt).toLocaleDateString(),
        dueDate: new Date(invoice.DueDate).toLocaleDateString(),
        status: invoice.Balance === 0 ? 'Paid' : 'Due',
        currency: invoice.CurrencyRef?.name || 'USD',
        pdfUrl: invoice.pdfUrl,
        pdfDownloadUrl: invoice.pdfDownloadUrl,
        aforoInvoiceId: invoice.aforoInvoiceId,
      }));
      
      console.log('Formatted invoices:', formattedInvoices);
      console.log('Setting invoices state with', formattedInvoices.length, 'invoices');
      setAllInvoices(formattedInvoices);
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

  const handleFilterClick = () => {
    // Handle filter click - can open a filter modal or show filter options
    console.log('Filter clicked');
  };

  const handleRowClick = (invoice: Invoice) => {
    const pdfUrl = `http://44.204.127.27:8095${invoice.pdfUrl}`;
    window.open(pdfUrl, '_blank');
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
    // {
    //   key: "balance",
    //   title: "Balance",
    //   render: (row) => `${row.currency} ${row.balance.toFixed(2)}`,
    // },
    {
      key: "generatedOn",
      title: "Generated On",
      render: (row) => row.generatedOn,
    },
   
    {
      key: "status",
      title: "Status",
      render: (row) => (
        <StatusBadge
          label={row.status}
          variant={row.status === 'Paid' ? 'active' : 'draft'}
          size="sm"
        />
      ),
    },
     {
      key: "dueDate",
      title: "Due Date",
      render: (row) => row.dueDate,
    },
    {
      key: "actions",
      title: "Actions",
      render: (row) => {
        const downloadUrl = `http://44.204.127.27:8095${row.pdfDownloadUrl}`;
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              window.open(downloadUrl, '_blank');
            }}
            style={{
              padding: '8px',
              borderRadius: '8px',
              background: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: '#F5F9FF',
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M6.62988 8.62988V0.629883M6.62988 8.62988L3.29655 5.29655M6.62988 8.62988L9.96322 5.29655M12.6299 8.62988V11.2965C12.6299 11.6502 12.4894 11.9893 12.2394 12.2394C11.9893 12.4894 11.6502 12.6299 11.2965 12.6299H1.96322C1.60959 12.6299 1.27046 12.4894 1.02041 12.2394C0.770359 11.9893 0.629883 11.6502 0.629883 11.2965V8.62988" stroke="#1D7AFC" stroke-width="1.26" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        );
      },
    },
  ];

  return (
    <div className="inv-page">
      {/* Header */}
      <PageHeader
        title="Invoices"
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        searchDisabled={hasNoInvoices}
        showPrimary={true}
        showIntegrations={false}
        useIntegrationButton={true}
        onPrimaryClick={handlePrimaryClick}
        onSettingsClick={handleExploreIntegrations}
        onFilterClick={handleFilterClick}
      />

      {/* Table */}
      <DataTable
        columns={columns}
        rows={invoices}
        rowKey={(row) => row.id}
        onRowClick={handleRowClick}
        emptyIcon={
          searchTerm.trim() ? (
            <img src={noSearchImage} alt="No search results" width={169} height={169} />
          ) : (
            <img src={invoicesImage} alt="No invoices" width={169} height={169} />
          )
        }
        emptyText={
          searchTerm.trim()
            ? `No invoices found matching "${searchTerm}". Try adjusting your search terms.`
            : invoices.length === 0 && !isLoading
              ? "You don’t have any invoices right now. Connect an integration to start generating invoices automatically and keep your billing in sync."
              : "Loading invoices..."
        }
        emptyAction={
          !isLoading && invoices.length === 0 && !searchTerm.trim() && (
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
