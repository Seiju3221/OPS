import React, { useState, useEffect } from 'react';
import { Shield, ShieldAlert, ShieldCheck, ShieldX } from 'lucide-react';

const PasswordStrengthBar = ({ password }) => {
  const [strength, setStrength] = useState(0);
  const [message, setMessage] = useState('');
  const [requirements, setRequirements] = useState([
    { label: 'Length', met: false, regex: /.{8,}/ },
    { label: 'Uppercase', met: false, regex: /[A-Z]/ },
    { label: 'Lowercase', met: false, regex: /[a-z]/ },
    { label: 'Number', met: false, regex: /\d/ },
    { label: 'Special Char', met: false, regex: /[!@#$%^&*(),.?":{}|<>]/ }
  ]);

  useEffect(() => {
    calculateStrength(password);
  }, [password]);

  const calculateStrength = (pass) => {
    const updatedRequirements = requirements.map(req => ({
      ...req,
      met: req.regex.test(pass)
    }));

    const metRequirements = updatedRequirements.filter(req => req.met).length;
    const score = (metRequirements / requirements.length) * 100;

    const unmetReqs = updatedRequirements
      .filter(req => !req.met)
      .map(req => req.label);

    setRequirements(updatedRequirements);
    setStrength(score);
    setMessage(unmetReqs.length ? unmetReqs.join(' • ') : 'Strong password!');
  };

  const getStrengthDetails = () => {
    if (strength >= 100) return { color: 'green', icon: ShieldCheck, text: 'Very Strong' };
    if (strength >= 80) return { color: 'blue', icon: ShieldCheck, text: 'Strong' };
    if (strength >= 60) return { color: 'yellow', icon: ShieldAlert, text: 'Moderate' };
    if (strength >= 40) return { color: 'orange', icon: ShieldX, text: 'Weak' };
    return { color: 'red', icon: ShieldX, text: 'Very Weak' };
  };

  const { color, icon: StrengthIcon, text } = getStrengthDetails();

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <StrengthIcon 
          className={`w-6 h-6 text-${color}-500`} 
          strokeWidth={2} 
        />
        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 bg-${color}-500`}
            style={{ width: `${strength}%` }}
          />
        </div>
        <span className={`text-sm font-semibold text-${color}-500`}>
          {text}
        </span>
      </div>
      {message && (
        <div className="flex items-center space-x-2 text-gray-600">
          <Shield className="w-4 h-4 text-gray-400" />
          <p className="text-sm">{message}</p>
        </div>
      )}
      <div className="grid grid-cols-5 gap-1">
        {requirements.map((req, index) => (
          <div 
            key={index} 
            className={`h-1 rounded-full ${req.met ? `bg-green-500` : 'bg-gray-300'}`}
          />
        ))}
      </div>
    </div>
  );
};

export default PasswordStrengthBar;