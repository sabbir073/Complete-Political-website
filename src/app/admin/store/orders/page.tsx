'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/providers/ThemeProvider';
import { useSweetAlert } from '@/hooks/useSweetAlert';
import { format } from 'date-fns';
import { FaShoppingBag, FaEye, FaTimes, FaTrash, FaCheck, FaTruck, FaBox, FaClock } from 'react-icons/fa';

interface OrderItem {
  id: string;
  product_name: string;
  variant_info?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  customer_address: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
  status: 'pending' | 'processing' | 'delivered' | 'cancelled';
  notes?: string;
  admin_notes?: string;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'yellow', icon: FaClock },
  processing: { label: 'Processing', color: 'blue', icon: FaBox },
  delivered: { label: 'Delivered', color: 'green', icon: FaCheck },
  cancelled: { label: 'Cancelled', color: 'red', icon: FaTimes },
};

export default function AdminStoreOrdersPage() {
  const { isDark } = useTheme();
  const { showSuccess, showError, showConfirm } = useSweetAlert();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/admin/store/orders');
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      showError('Error', 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdating(true);
    try {
      const response = await fetch('/api/admin/store/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update order');

      showSuccess('Success', `Order status updated to ${STATUS_CONFIG[newStatus as keyof typeof STATUS_CONFIG].label}`);
      fetchOrders();

      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus as Order['status'] });
      }
    } catch (error) {
      showError('Error', 'Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const updateAdminNotes = async (orderId: string, notes: string) => {
    try {
      const response = await fetch('/api/admin/store/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, admin_notes: notes }),
      });

      if (!response.ok) throw new Error('Failed to update notes');
      showSuccess('Success', 'Notes updated');
      fetchOrders();
    } catch (error) {
      showError('Error', 'Failed to update notes');
    }
  };

  const deleteOrder = async (order: Order) => {
    const confirmed = await showConfirm(
      'Delete Order',
      `Are you sure you want to delete order ${order.order_number}? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/admin/store/orders?id=${order.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete order');

      showSuccess('Success', 'Order deleted');
      fetchOrders();
      setSelectedOrder(null);
    } catch (error) {
      showError('Error', 'Failed to delete order');
    }
  };

  const filteredOrders = filterStatus === 'all'
    ? orders
    : orders.filter(o => o.status === filterStatus);

  const getStatusCounts = () => {
    return {
      all: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      processing: orders.filter(o => o.status === 'processing').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length,
    };
  };

  const statusCounts = getStatusCounts();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Orders
        </h1>
        <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Manage customer orders and update their status
        </p>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {['all', 'pending', 'processing', 'delivered', 'cancelled'].map((status) => {
          const isActive = filterStatus === status;
          const config = status === 'all' ? null : STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];
          const count = statusCounts[status as keyof typeof statusCounts];

          return (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                isActive
                  ? 'bg-red-600 text-white'
                  : isDark
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status === 'all' ? 'All' : config?.label}
              <span className={`px-2 py-0.5 text-xs rounded-full ${
                isActive
                  ? 'bg-white/20 text-white'
                  : isDark
                    ? 'bg-gray-600 text-gray-300'
                    : 'bg-gray-200 text-gray-600'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Orders Table */}
      {filteredOrders.length === 0 ? (
        <div className={`text-center py-12 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow`}>
          <FaShoppingBag className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
          <h3 className={`text-lg font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            No orders found
          </h3>
          <p className={`mt-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            {filterStatus === 'all' ? 'Orders will appear here when customers place them' : `No ${filterStatus} orders`}
          </p>
        </div>
      ) : (
        <div className={`rounded-lg overflow-hidden shadow ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
                <tr>
                  <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Order
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Customer
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Items
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Total
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Status
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Date
                  </th>
                  <th className={`px-4 py-3 text-center text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={isDark ? 'divide-y divide-gray-700' : 'divide-y divide-gray-200'}>
                {filteredOrders.map((order) => {
                  const config = STATUS_CONFIG[order.status];
                  const StatusIcon = config.icon;

                  return (
                    <tr key={order.id} className={isDark ? 'hover:bg-gray-750' : 'hover:bg-gray-50'}>
                      <td className="px-4 py-3">
                        <span className={`font-mono text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {order.order_number}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {order.customer_name}
                          </p>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {order.customer_phone}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          {order.items?.length || 0} item(s)
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          ৳{order.total.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${
                          config.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                          config.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                          config.color === 'green' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          <StatusIcon className="w-3 h-3" />
                          {config.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {format(new Date(order.created_at), 'MMM d, yyyy')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className={`p-2 rounded-lg transition-colors ${
                              isDark
                                ? 'hover:bg-gray-700 text-gray-400 hover:text-white'
                                : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                            }`}
                            title="View Details"
                          >
                            <FaEye />
                          </button>
                          <button
                            onClick={() => deleteOrder(order)}
                            className="p-2 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                            title="Delete Order"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedOrder(null)} />
          <div
            className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl ${
              isDark ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            {/* Modal Header */}
            <div className={`sticky top-0 z-10 flex items-center justify-between p-4 border-b ${
              isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
            }`}>
              <div>
                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Order {selectedOrder.order_number}
                </h2>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {format(new Date(selectedOrder.created_at), 'MMMM d, yyyy h:mm a')}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className={`p-2 rounded-lg transition-colors ${
                  isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <FaTimes />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Status Update */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Order Status
                </label>
                <div className="flex flex-wrap gap-2">
                  {(['pending', 'processing', 'delivered', 'cancelled'] as const).map((status) => {
                    const config = STATUS_CONFIG[status];
                    const isActive = selectedOrder.status === status;
                    const StatusIcon = config.icon;

                    return (
                      <button
                        key={status}
                        onClick={() => updateOrderStatus(selectedOrder.id, status)}
                        disabled={updating || isActive}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                          isActive
                            ? config.color === 'yellow' ? 'bg-yellow-500 text-white' :
                              config.color === 'blue' ? 'bg-blue-500 text-white' :
                              config.color === 'green' ? 'bg-green-500 text-white' :
                              'bg-red-500 text-white'
                            : isDark
                              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <StatusIcon className="w-4 h-4" />
                        {config.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Customer Info */}
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h3 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Customer Information
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>Name</p>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {selectedOrder.customer_name}
                    </p>
                  </div>
                  <div>
                    <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>Phone</p>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {selectedOrder.customer_phone}
                    </p>
                  </div>
                  {selectedOrder.customer_email && (
                    <div>
                      <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>Email</p>
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {selectedOrder.customer_email}
                      </p>
                    </div>
                  )}
                  <div className="col-span-2">
                    <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>Address</p>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {selectedOrder.customer_address}
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Order Items
                </h3>
                <div className={`rounded-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  {selectedOrder.items?.map((item, index) => (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between p-4 ${
                        index > 0 ? (isDark ? 'border-t border-gray-700' : 'border-t border-gray-200') : ''
                      }`}
                    >
                      <div>
                        <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {item.product_name}
                        </p>
                        {item.variant_info && (
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {item.variant_info}
                          </p>
                        )}
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          ৳{item.unit_price.toLocaleString()} × {item.quantity}
                        </p>
                      </div>
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        ৳{item.total_price.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Total */}
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Subtotal</span>
                    <span className={isDark ? 'text-white' : 'text-gray-900'}>
                      ৳{selectedOrder.subtotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Delivery Fee</span>
                    <span className={isDark ? 'text-white' : 'text-gray-900'}>
                      ৳{selectedOrder.delivery_fee.toLocaleString()}
                    </span>
                  </div>
                  <div className={`flex justify-between pt-2 border-t font-bold text-lg ${
                    isDark ? 'border-gray-600' : 'border-gray-300'
                  }`}>
                    <span className={isDark ? 'text-white' : 'text-gray-900'}>Total</span>
                    <span className="text-red-600">৳{selectedOrder.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Customer Notes */}
              {selectedOrder.notes && (
                <div>
                  <h3 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Customer Notes
                  </h3>
                  <p className={`text-sm p-3 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-50 text-gray-700'}`}>
                    {selectedOrder.notes}
                  </p>
                </div>
              )}

              {/* Admin Notes */}
              <div>
                <h3 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Admin Notes
                </h3>
                <textarea
                  defaultValue={selectedOrder.admin_notes || ''}
                  onBlur={(e) => {
                    if (e.target.value !== (selectedOrder.admin_notes || '')) {
                      updateAdminNotes(selectedOrder.id, e.target.value);
                    }
                  }}
                  rows={3}
                  placeholder="Add internal notes about this order..."
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                  }`}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className={`sticky bottom-0 flex items-center justify-between p-4 border-t ${
              isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
            }`}>
              <button
                onClick={() => deleteOrder(selectedOrder)}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <FaTrash /> Delete Order
              </button>
              <button
                onClick={() => setSelectedOrder(null)}
                className={`px-6 py-2 rounded-lg transition-colors ${
                  isDark
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
