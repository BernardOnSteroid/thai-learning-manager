// Thai Learning Manager - Admin Panel
// Version: 1.8.0

console.log('📊 Admin panel script loading...');

// Helper to get auth token
function getAuthToken() {
  return localStorage.getItem('authToken') || localStorage.getItem('token');
}

// Check if user is admin and show/hide admin link
async function checkAdminAccess() {
  console.log('🔍 checkAdminAccess() called');
  const token = getAuthToken();
  console.log('Token available?', !!token);
  
  if (!token) {
    console.log('❌ No token found, skipping admin check');
    return false;
  }
  
  try {
    console.log('🌐 Fetching /api/admin/stats...');
    const response = await fetch('/api/admin/stats', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('📥 Admin stats response:', response.status, response.ok);
    
    if (response.ok) {
      // User is admin, show admin link
      const adminLink = document.getElementById('admin-nav-link');
      console.log('🔗 Admin link element found?', !!adminLink);
      if (adminLink) {
        adminLink.style.display = 'inline-block';
        console.log('✅ Admin link shown!');
      }
      return true;
    } else {
      console.log('❌ Not admin or unauthorized');
    }
    return false;
  } catch (error) {
    console.error('❌ Admin check failed:', error);
    return false;
  }
}

console.log('✅ Admin panel script loaded, checkAdminAccess defined');

// Load admin stats
async function loadAdminStats() {
  try {
    const response = await fetch('/api/admin/stats', {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch stats');
    }
    
    const stats = await response.json();
    
    const statsHTML = `
      <div class="bg-white rounded-lg shadow p-6">
        <div class="text-3xl font-bold text-gray-800">${stats.users.total_users || 0}</div>
        <div class="text-sm text-gray-600 mt-1">Total Users</div>
      </div>
      <div class="bg-green-50 rounded-lg shadow p-6">
        <div class="text-3xl font-bold text-green-600">${stats.users.active_users || 0}</div>
        <div class="text-sm text-gray-600 mt-1">Active Users</div>
      </div>
      <div class="bg-yellow-50 rounded-lg shadow p-6">
        <div class="text-3xl font-bold text-yellow-600">${stats.users.trial_users || 0}</div>
        <div class="text-sm text-gray-600 mt-1">Trial Users</div>
      </div>
      <div class="bg-blue-50 rounded-lg shadow p-6">
        <div class="text-3xl font-bold text-blue-600">${stats.users.paid_users || 0}</div>
        <div class="text-sm text-gray-600 mt-1">Paid Users</div>
      </div>
    `;
    
    document.getElementById('admin-stats').innerHTML = statsHTML;
  } catch (error) {
    console.error('Error loading admin stats:', error);
  }
}

// Load users list
async function loadUsers() {
  try {
    const response = await fetch('/api/admin/users', {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }
    
    const data = await response.json();
    const users = data.users;
    
    let tableHTML = `
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subscription</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
    `;
    
    users.forEach(user => {
      const statusBadge = user.is_active ? 
        '<span class="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Active</span>' :
        '<span class="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Locked</span>';
      
      const subscriptionBadge = {
        'trial': '<span class="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Trial</span>',
        'active': '<span class="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Active</span>',
        'expired': '<span class="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Expired</span>',
        'cancelled': '<span class="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Cancelled</span>'
      }[user.subscription_status] || '<span class="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Unknown</span>';
      
      const createdDate = new Date(user.created_at).toLocaleDateString();
      const adminBadge = user.is_admin ? '<span class="ml-2 px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">Admin</span>' : '';
      
      tableHTML += `
        <tr>
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="text-sm font-medium text-gray-900">${user.name || 'N/A'}${adminBadge}</div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="text-sm text-gray-900">${user.email}</div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">${statusBadge}</td>
          <td class="px-6 py-4 whitespace-nowrap">${subscriptionBadge}</td>
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="text-sm text-gray-900">${createdDate}</div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="text-sm text-gray-900">${user.entries_count || 0} entries</div>
            <div class="text-sm text-gray-500">${user.progress_count || 0} learned</div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
            <button 
              onclick="toggleUserStatus('${user.id}')" 
              class="text-${user.is_active ? 'red' : 'green'}-600 hover:text-${user.is_active ? 'red' : 'green'}-900 mr-3"
              title="${user.is_active ? 'Lock Account' : 'Unlock Account'}">
              <i class="fas fa-${user.is_active ? 'lock' : 'unlock'}"></i>
              ${user.is_active ? 'Lock' : 'Unlock'}
            </button>
          </td>
        </tr>
      `;
    });
    
    tableHTML += `
          </tbody>
        </table>
      </div>
    `;
    
    document.getElementById('users-table-container').innerHTML = tableHTML;
  } catch (error) {
    console.error('Error loading users:', error);
    document.getElementById('users-table-container').innerHTML = `
      <div class="text-center py-8">
        <i class="fas fa-exclamation-triangle text-4xl text-red-400"></i>
        <p class="text-red-500 mt-4">Failed to load users</p>
        <button onclick="loadUsers()" class="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Retry
        </button>
      </div>
    `;
  }
}

// Toggle user active status
async function toggleUserStatus(userId) {
  if (!confirm('Are you sure you want to change this user\'s account status?')) {
    return;
  }
  
  try {
    const response = await fetch(`/api/admin/users/${userId}/toggle-active`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to toggle user status');
    }
    
    const result = await response.json();
    
    // Show success message
    showNotification(
      `User account ${result.user.is_active ? 'unlocked' : 'locked'} successfully`,
      'success'
    );
    
    // Reload users list
    await loadUsers();
    await loadAdminStats();
  } catch (error) {
    console.error('Error toggling user status:', error);
    showNotification('Failed to update user status', 'error');
  }
}

// Initialize admin page when navigating to it
function initAdminPage() {
  console.log('Initializing admin page...');
  loadAdminStats();
  loadUsers();
}

// Make functions available globally
window.checkAdminAccess = checkAdminAccess;
window.initAdminPage = initAdminPage;
window.toggleUserStatus = toggleUserStatus;
window.loadUsers = loadUsers;
window.loadAdminStats = loadAdminStats;
