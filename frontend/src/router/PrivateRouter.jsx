import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import Modal from '../utils/Modal';

const PrivateRouter = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  if (!user) {
    if (!showModal) setShowModal(true);

    return (
      showModal && (
        <Modal
          message="You need to be logged in to access this page."
          onClose={() => {
            setShowModal(false);
            navigate('/login', { state: { from: location } });
          }}
        />
      )
    );
  }

  return children;
};

export default PrivateRouter;
