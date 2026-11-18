import Loader from "../../components/common/Loader";
import {

    useEffect,
    useState

} from "react";

import RevenueService from "../../services/RevenueService";

import type{

    RevenueSummary,
    MonthlyRevenue,
    PaymentHistory

} from "../../types/Revenue";

import RevenueSummaryCard from "../../components/vendor/revenue/RevenueSummaryCard";

import RevenueChart from "../../components/vendor/revenue/RevenueChart";

import RecentPaymentsTable from "../../components/vendor/revenue/RecentPaymentsTable";

import "./VendorRevenue.css";

export default function VendorRevenue(){

    const[summary,setSummary]=useState<RevenueSummary>();

    const[chart,setChart]=useState<MonthlyRevenue[]>([]);

    const[payments,setPayments]=useState<PaymentHistory[]>([]);

    useEffect(()=>{

        loadRevenue();

    },[]);

    async function loadRevenue(){

        setSummary(

            await RevenueService.getRevenueSummary()

        );

        setChart(

            await RevenueService.getMonthlyRevenue()

        );

        setPayments(

            await RevenueService.getPaymentHistory()

        );

    }

    if(!summary){

        return <Loader />;

    }

    return(

        <section className="vendor-revenue">

            <div className="page-header">

                <h1>

                    Revenue & Earnings

                </h1>

                <p>

                    Track your business performance.

                </p>

            </div>

            <div className="summary-grid">

                <RevenueSummaryCard

                    title="This Month"

                    value={`₹${summary.thisMonth.toLocaleString()}`}

                />

                <RevenueSummaryCard

                    title="Total Revenue"

                    value={`₹${summary.totalRevenue.toLocaleString()}`}

                />

                <RevenueSummaryCard

                    title="Pending Payments"

                    value={`₹${summary.pendingPayments.toLocaleString()}`}

                />

                <RevenueSummaryCard

                    title="Average Booking"

                    value={`₹${summary.averageBookingValue.toLocaleString()}`}

                />

            </div>

            <RevenueChart

                data={chart}

            />

            <RecentPaymentsTable

                payments={payments}

            />

        </section>

    );

}
