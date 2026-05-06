import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, Shield, Calendar } from 'lucide-react';
import './Profile.css';

const Profile = () => {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!user) return null;

  return (
    <div className={`profile-container container ${mounted ? 'animate-fade-in' : ''}`}>
      <div className="profile-header">
        <h1>My Profile</h1>
        <p>Manage your account settings and preferences.</p>
      </div>

      <div className="profile-content">
        <div className="card profile-card">
          <div className="profile-avatar-section">
            <div className="profile-avatar">
              {user.fullName.charAt(0).toUpperCase()}
            </div>
            <div className="profile-title">
              <h2>{user.fullName}</h2>
              <span className={`role-badge role-${user.role.toLowerCase()}`}>
                {user.role}
              </span>
            </div>
          </div>

          <div className="profile-details">
            <div className="detail-item">
              <div className="detail-icon">
                <Mail size={20} />
              </div>
              <div className="detail-info">
                <span className="detail-label">Email Address</span>
                <span className="detail-value">{user.email}</span>
              </div>
            </div>

            <div className="detail-item">
              <div className="detail-icon">
                <Phone size={20} />
              </div>
              <div className="detail-info">
                <span className="detail-label">Phone Number</span>
                <span className="detail-value">{user.phoneNumber || 'Not provided'}</span>
              </div>
            </div>

            <div className="detail-item">
              <div className="detail-icon">
                <Shield size={20} />
              </div>
              <div className="detail-info">
                <span className="detail-label">Account Role</span>
                <span className="detail-value">{user.role}</span>
              </div>
            </div>
          </div>
          
          <div className="profile-actions">
            {/* Future enhancement: Edit Profile */}
            {/* <button className="btn-primary">Edit Profile</button> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
