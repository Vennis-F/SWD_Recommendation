import React, { useEffect, useState } from 'react'
import { Card, Col, Layout, PageHeader, Row, Statistic } from 'antd'
import TableCustom from 'components/CustomTable'
import { getDashboardAdmin } from './dashboard.service';
import { firstColumns, firstData, secondColumns, secondData, labels, thridColumns, thridData, fifthColumns, fourthColumns } from './constants';

import './style.less'


function AdminDashboard() {
    const [params, setParams] = useState();
    const [loading, setLoading] = useState(false);
    const [dataAdminCategory, setAdminCategory] = useState();
    const [dataAdminRate, setAdminRate] = useState();
    const [dataAdminOrder, setAdminOrder] = useState();
    const [dataAdmiCustomerRegister, setAdminCustomerRegister] = useState();
    const [dataAdmiCustomerBought, setAdminCustomerBought] = useState();
    const [dataMarketing, setDataMarketing] = useState();
    const [dataAdminSubmiited, setDataAdminSubmiited] = useState();
    const [dataAdminSuccess, setDataAdminSuccess] = useState();
    const [dataAdminCancel, setDataAdminCancel] = useState();

    const [data, setData] = useState([]);


    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Doanh thu ',
            },
        },
    };

    const dataChart = {
        labels,
        datasets: [
            {
                label: 'Doanh thu',
                data: [0, 1099232, 5699342, 4561232, 7893211, 4513589, 2341321],
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
            },
        ],
    };

    const fetchDashboardData = () => {
        setLoading(true);
        getDashboardAdmin()
            .then((result) => {
                setAdminCategory(result?.categories);
                setAdminRate(result?.feedbackStatic);
                setAdminOrder(result?.orderStatics);
                // setTotalItem(result?.count);
                setDataAdminSubmiited(result?.productStatuses.find(item => item.status === 'submitted').count);
                setDataAdminSuccess(result?.productStatuses.find(item => item.status === 'success').count);
                setDataAdminCancel(result?.productStatuses.find(item => item.status === 'cancelled').count);

                // setDataAdminStatic(result?.productStatuses);
                setAdminCustomerRegister(result?.newlyRegisteredCustomer);
                setAdminCustomerBought(result?.newlyBoughtCustomer);
                setLoading(false);
            })
            .catch((e) => setLoading(false));
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    return (
        <Layout className="layoutContent">
            <PageHeader
                ghost={false}
                title="Dashboard"
                // extra={extraButton}
                className="customPageHeader"
            >
                <div className="site-statistic-demo-card">
                    <Row gutter={16} >
                        <Col span={8}>
                            <Card>
                                <Statistic
                                    title="?????i x??c nh??n"
                                    value={dataAdminSubmiited}
                                    valueStyle={{
                                        color: '#ffc300',
                                    }}
                                />
                            </Card>
                        </Col>
                        <Col span={8}>
                            <Card>
                                <Statistic
                                    title="Ho??n th??nh"
                                    value={dataAdminSuccess}
                                    valueStyle={{
                                        color: '#3f8600',
                                    }}
                                />
                            </Card>
                        </Col>
                        <Col span={8}>
                            <Card>
                                <Statistic
                                    title="H???y"
                                    value={dataAdminCancel}
                                    valueStyle={{
                                        color: '#cf1322',
                                    }}
                                />
                            </Card>
                        </Col>
                        {/* <Col span={6}>
                            <Card>
                                <Statistic
                                    title="Doanh Thu"
                                    value={9}
                                    valueStyle={{
                                        color: '#cf1322',
                                    }}
                                />
                            </Card>
                        </Col> */}
                    </Row>
                </div>
            </PageHeader>
            <Layout.Content>
                <Row style={{ marginBottom: '10px' }} >
                    <Col lg={{ span: 11 }} offset={1}>
                        <TableCustom columns={thridColumns} dataSource={dataAdminOrder} scroll={{ y: 320 }} title={() => <span style={{ fontSize: "bold" }}>T???ng ????n h??ng</span>} pagination={false} />
                    </Col>
                    <Col lg={{ span: 11 }}
                        style={{ marginLeft: '15px' }}
                    >
                        <TableCustom columns={secondColumns} dataSource={dataAdminRate} title={() => <span style={{ fontSize: "bold" }}>????nh gi??</span>} pagination={false} scroll={{ y: 210 }} />
                    </Col>
                </Row>
                <Row style={{ marginBottom: 20, marginTop: 40 }}>
                    {/* // top 5 post g???n ????y (d??ng table) */}
                    <Col lg={{ span: 11 }} style={{ marginLeft: '55px', marginRight: '20px' }} >
                        <TableCustom columns={firstColumns} dataSource={dataAdminCategory} scroll={{ y: 320 }} title={() => <span style={{ fontSize: "bold" }}>????n h??ng th??nh c??ng</span>} pagination={false} />
                    </Col>
                    {/* // th??ng s??? b??n h??ng(d??ng chart) */}
                    <Col lg={{ span: 11 }}
                    // style={{ minHeight: 400 }}
                    >
                        <TableCustom columns={fourthColumns} dataSource={dataAdmiCustomerBought} title={() => <span style={{ fontSize: "bold" }}>T??i kho???n ho???t ?????ng g???n ????y</span>} pagination={false} scroll={{ y: 210 }} />
                    </Col>
                    {/* // th??ng s??? kh??ch h??ng(email, s??? ti???n chi tr???) (d??ng table) */}

                    {/* //kh??c h??ng g???n ????y (d??ng table) */}
                </Row>
                <Row>
                    <Col lg={{ span: 11 }} style={{ marginLeft: '55px', marginRight: '20px' }} >
                        <TableCustom columns={fifthColumns} dataSource={dataAdmiCustomerRegister} scroll={{ y: 320 }} title={() => <span style={{ fontSize: "bold" }}>Kh??nh h??ng m???i ????ng k??</span>} pagination={false} />
                    </Col>
                </Row>
            </Layout.Content>
        </Layout>
    );
}

export default AdminDashboard;