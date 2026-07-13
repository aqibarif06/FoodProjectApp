import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  useDispatch,
  useSelector,
} from "react-redux";
import { toast } from "react-toastify";
import DataTableModule from "react-data-table-component";

import Loader from "../layout/Loader";

import {
  allOrders,
  updateOrder,
} from "../../redux/actions/orderActions";

import {
  clearErrors,
} from "../../redux/slices/orderSlice";

import "./AdminOrders.css";

const DataTable =
  DataTableModule.default || DataTableModule;

const AdminOrders = () => {
  const dispatch = useDispatch();

  const {
    loading,
    error,
    orders,
    totalAmount,
  } = useSelector((state) => state.order);

  useEffect(() => {
    dispatch(allOrders());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error, {
        position: "bottom-right",
      });

      dispatch(clearErrors());
    }
  }, [error, dispatch]);

  const updateOrderHandler = async (id) => {
    await dispatch(updateOrder(id, "Delivered"));

    toast.success("Order marked as Delivered");

    dispatch(allOrders());
  };

  const columns = [
    {
      name: "Order ID",
      selector: (row) => row.id,
      sortable: true,
    },
    {
      name: "User",
      selector: (row) => row.user,
      sortable: true,
    },
    {
      name: "Restaurant",
      selector: (row) => row.restaurant,
      sortable: true,
    },
    {
      name: "Items",
      selector: (row) => row.items,
      sortable: true,
    },
    {
      name: "Amount",
      selector: (row) => row.amount,
      sortable: true,
    },
    {
      name: "Status",
      cell: (row) => (
        <span
          className={
            row.status === "Delivered"
              ? "admin-status-delivered"
              : "admin-status-processing"
          }
        >
          {row.status}
        </span>
      ),
      sortable: true,
    },
    {
      name: "Action",
      cell: (row) => (
        <>
          <Link
            to={`/eats/orders/${row.id}`}
            className="btn btn-primary btn-sm me-2"
          >
            View
          </Link>

          {row.status !== "Delivered" && (
            <button
              className="btn btn-success btn-sm"
              onClick={() =>
                updateOrderHandler(row.id)
              }
            >
              Deliver
            </button>
          )}
        </>
      ),
    },
  ];

  const data =
    orders?.map((order) => ({
      id: order._id,
      user: order.user?.name || "Unknown",
      restaurant:
        order.restaurant?.name || "Unknown",
      items: order.orderItems?.length || 0,
      amount: `₹${order.finalTotal}`,
      status: order.orderStatus,
    })) || [];

  return (
    <div className="admin-orders-container">
      <h1 className="admin-orders-title">
        All Orders
      </h1>

      <div className="admin-orders-summary">
        <h4>
          Total Orders: {orders?.length || 0}
        </h4>

        <h4>
          Total Amount: ₹{totalAmount || 0}
        </h4>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <DataTable
          columns={columns}
          data={data}
          pagination
          highlightOnHover
          striped
          responsive
          customStyles={customStyles}
        />
      )}
    </div>
  );
};

const customStyles = {
  headCells: {
    style: {
      fontWeight: "bold",
      fontSize: "15px",
      backgroundColor: "#f8f9fa",
    },
  },
  rows: {
    style: {
      fontSize: "14px",
    },
  },
};

export default AdminOrders;