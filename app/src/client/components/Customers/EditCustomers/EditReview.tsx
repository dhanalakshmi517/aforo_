import React from "react";
import "./EditReview.css"; // use the same Review.css used by Usage Metric Review
import { AccountDetailsData } from "./EditAccount";
import ReviewComponent, { ReviewRow } from "../../componenetsss/ReviewComponent";

interface EditReviewProps {
  customerName: string;
  companyName: string;
  companyType: string;
  accountDetails: AccountDetailsData | null;
}

const formatValue = (value: string | undefined | null): string => {
  return value && value.trim() !== "" ? value : "-";
};

const EditReview: React.FC<EditReviewProps> = ({
  customerName,
  companyName,
  companyType,
  accountDetails,
}) => {
  const customerRows: ReviewRow[] = [
    { label: "Customer Name", value: formatValue(customerName) },
    { label: "Company Name", value: formatValue(companyName) },
    { label: "Company Type", value: formatValue(companyType) },
  ];

  const accountRows: ReviewRow[] = [
    { label: "Phone Number", value: formatValue(accountDetails?.phoneNumber) },
    { label: "Primary Email", value: formatValue(accountDetails?.primaryEmail) },
    {
      label: "Additional Email Recipients",
      value:
        accountDetails?.additionalEmailRecipients?.length
          ? accountDetails.additionalEmailRecipients.join(", ")
          : "-",
    },
  ];

  const customerAddressRows: ReviewRow[] = [
    {
      label: "Customer Address Line 1",
      value: formatValue(accountDetails?.customerAddressLine1),
    },
    {
      label: "Customer Address Line 2",
      value: formatValue(accountDetails?.customerAddressLine2),
    },
    { label: "Customer City", value: formatValue(accountDetails?.customerCity) },
    {
      label: "Customer State/Province",
      value: formatValue(accountDetails?.customerState),
    },
    {
      label: "Customer Postal Code",
      value: formatValue(accountDetails?.customerPostalCode),
    },
    {
      label: "Customer Country",
      value: formatValue(accountDetails?.customerCountry),
    },
  ];

  const billingRows: ReviewRow[] = [
    {
      label: "Billing Same As Customer",
      value: accountDetails?.billingSameAsCustomer ? "Yes" : "No",
    },
    {
      label: "Billing Address Line 1",
      value: formatValue(accountDetails?.billingAddressLine1),
    },
    {
      label: "Billing Address Line 2",
      value: formatValue(accountDetails?.billingAddressLine2),
    },
    { label: "Billing City", value: formatValue(accountDetails?.billingCity) },
    {
      label: "Billing State/Province",
      value: formatValue(accountDetails?.billingState),
    },
    {
      label: "Billing Postal Code",
      value: formatValue(accountDetails?.billingPostalCode),
    },
    {
      label: "Billing Country",
      value: formatValue(accountDetails?.billingCountry),
    },
  ];

  return (
    <div className="met-review-container">
      <ReviewComponent title="CUSTOMER DETAILS" rows={customerRows} />
      <ReviewComponent title="ACCOUNT DETAILS" rows={accountRows} />
      <ReviewComponent title="CUSTOMER ADDRESS" rows={customerAddressRows} />
      <ReviewComponent title="BILLING ADDRESS" rows={billingRows} />
    </div>
  );
};

export default EditReview;
