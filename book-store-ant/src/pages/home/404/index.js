import { Button, Result } from 'antd';
import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
  const navigate = useNavigate();
  const handleReturnHome = () => {
    const role = localStorage.getItem('__role');
    if (role === 'R03' || role === 'R04' || (role === 'R05') | (role === 'R00'))
      return navigate('/dashboard');
    return navigate('/');
  };

  return (
    <Result
      status="404"
      title="404"
      subTitle="Xin lỗi, trang bạn truy cập không tồn tại"
      extra={
        <Button onClick={handleReturnHome} type="primary">
          Trở về nhà
        </Button>
      }
    />
  );
};

export default NotFoundPage;
