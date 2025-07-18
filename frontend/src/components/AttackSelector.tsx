import React from 'react';

interface Props {
  value: 'basic' | 'heavy';
  onChange: (v: 'basic' | 'heavy') => void;
}

const AttackSelector: React.FC<Props> = ({ value, onChange }) => (
  <div style={{ marginTop: '0.5rem' }}>
    {(['basic', 'heavy'] as const).map((opt) => (
      <button
        key={opt}
        onClick={() => onChange(opt)}
        style={{
          marginRight: '0.25rem',
          backgroundColor: value === opt ? '#4caf50' : '#e0e0e0'
        }}
      >
        {opt === 'basic' ? 'Basic Attack' : 'Heavy Attack'}
      </button>
    ))}
  </div>
);

export default AttackSelector; 