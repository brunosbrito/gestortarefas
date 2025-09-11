import React from 'react';

const SimpleTest: React.FC = () => {
  return (
    <div style={{
      padding: '20px',
      border: '2px solid #4CAF50',
      borderRadius: '8px',
      backgroundColor: '#f0f8f0',
      margin: '20px',
      textAlign: 'center'
    }}>
      <h2 style={{ color: '#2E7D32', margin: '0 0 10px 0' }}>
        🎉 Microfrontend Funcionando!
      </h2>
      <p style={{ color: '#388E3C', margin: '0' }}>
        Este componente está sendo carregado via Module Federation
      </p>
      <p style={{ color: '#66BB6A', fontSize: '14px', margin: '10px 0 0 0' }}>
        Projeto: gestortarefas | Porta: 8080
      </p>
    </div>
  );
};

export default SimpleTest;