/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react';
import { EditOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import {
  Col,
  Form,
  Modal,
  Upload,
  Row,
  Input,
  Button,
  message,
  Checkbox,
  Select,
  InputNumber,
  DatePicker,
} from 'antd';
import 'moment/locale/vi';
import {
  createDepartment,
  createProduct,
  updateDepartment,
  updateProduct,
} from './product.service';
import {
  beforeUpload,
  fakeUpload,
  getBase64,
  normFile,
  uploadFileToFirebase,
  uuidv4,
} from 'util/file';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { storage } from 'firebase';
import moment from 'moment';
const ProductEdit = ({
  currentRow,
  onCallback,
  isEditModal,
  setIsEditModal,
  categoryList,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState();
  const [fileList, setFileList] = useState([]);
  const [defaultFileList, setDefaultFileList] = useState([]);
  const { TextArea } = Input;
  const { Option } = Select;
  const getDefaultFileList = (record) => {
    return [
      {
        uid: uuidv4(),
        name: 'image',
        url: record,
      },
    ];
  };

  const handleChange = ({ fileList }) =>
    setFileList(fileList.filter((file) => file.status !== 'error'));

  const onRemove = async (file) => {
    const index = fileList.indexOf(file);
    const newFileList = fileList.slice();
    newFileList.splice(index, 1);

    setFileList(newFileList);
  };
  const uploadButton = (
    <div>
      <PlusOutlined />
      <div
        style={{
          marginTop: 8,
        }}
      >
        Upload
      </div>
    </div>
  );
  useEffect(() => {
    return () => {
      form.resetFields();
    };
  }, [isEditModal]);

  useEffect(() => {
    setDefaultFileList([
      ...[],
      {
        uid: uuidv4(),
        name: 'image',
        url: currentRow?.thumbnail,
      },
    ]);
    return () => {
      setDefaultFileList([]);
    };
  }, [currentRow]);

  const onCancel = () => {
    setIsEditModal(false);
  };
  const onFinish = async (values) => {
    console.log(values);
    try {
      setLoading(true);
      // create
      if (!currentRow) {
        if (!values.thumbnail || values?.thumbnail.length === 0) {
          setLoading(false);
          return message.error('B???n ph???i up th??m ???nh n???a');
        }
        const imageUrl = await uploadFileToFirebase(
          values?.thumbnail[0]?.originFileObj
        );
        if (values.status === undefined) values.status = false;
        if (values.feartured === undefined) values.feartured = false;
        const createData = {
          ...values,
          thumbnail: imageUrl,
          briefInformation: {
            ...values.briefInformation,
            publicDate:
              values?.briefInformation?.publicDate.format('YYYY-MM-DD'),
          },
        };
        await createProduct(createData)
          .then((result) => {
            if (result) {
              message.success('Th??m m???i s???n ph???m th??nh c??ng!');
            }
            onCallback();
          })
          .catch((error) => message.error(error?.response?.data?.error));
        setLoading(false);
      }
      //Edit
      else {
        //C?? up ???nh
        if (values?.thumbnail[0]?.originFileObj) {
          const updateImageUrl = await uploadFileToFirebase(
            values?.thumbnail[0]?.originFileObj
          );
          delete values.thumbnail;
          const updateData = {
            ...values,
            id: currentRow?._id,
            thumbnail: updateImageUrl,
            briefInformation: {
              ...values.briefInformation,
              publicDate:
                values?.briefInformation?.publicDate.format('YYYY-MM-DD'),
            },
          };
          await updateProduct(updateData)
            .then((result) => {
              console.log(result);
              message.success('C???p nh???t s???n ph???m th??nh c??ng!');
              setLoading(false);
              onCallback();
            })
            .catch((error) => {
              message.error(error?.response?.data?.error);
              setLoading(false);
            });
        }
        //Kh??ng up ???nh
        else {
          delete values.thumbnail;
          const updateData = {
            ...values,
            id: currentRow?._id,
            briefInformation: {
              ...values.briefInformation,
              publicDate:
                values?.briefInformation?.publicDate.format('YYYY-MM-DD'),
            },
            thumbnail: currentRow?.thumbnail,
          };
          console.log(updateData);
          await updateProduct(updateData)
            .then((result) => {
              console.log(result);
              message.success('C???p nh???t s???n ph???m th??nh c??ng!');
              setLoading(false);
              onCallback();
            })
            .catch((error) => {
              console.log('error2', error);
              message.error(error?.response?.data?.error);
              setLoading(false);
            });
        }
      }
    } catch (error) {
      console.log('errorTong', error);
      message.error(error.message);
      setLoading(false);
      return false;
    }
  };

  const categoryOptions = categoryList.map((data) => {
    return {
      label: data?.name,
      value: data?._id,
    };
  });

  const initalValue = {
    title: currentRow ? currentRow?.title : undefined,
    listPrice: currentRow ? currentRow?.listPrice : undefined,
    quantity: currentRow ? currentRow?.quantity : undefined,
    description: currentRow ? currentRow?.description : undefined,
    feartured: currentRow ? currentRow?.feartured : undefined,
    status: currentRow ? currentRow?.status : undefined,
    salePrice: currentRow ? currentRow?.salePrice : undefined,
    thumbnail: currentRow
      ? getDefaultFileList(currentRow?.thumbnail)
      : undefined,
    category: currentRow ? currentRow?.category._id : undefined,
    briefInformation: currentRow
      ? {
          author: currentRow?.briefInformation?.author,
          language: currentRow?.briefInformation?.language,
          pages: currentRow?.briefInformation?.pages,
          publicDate: moment(currentRow?.briefInformation?.publicDate),
          publisher: currentRow?.briefInformation?.publisher,
        }
      : undefined,
  };
  return (
    <Modal
      title={currentRow ? 'C???p nh???t s???n ph???m' : 'T???o s???n ph???m'}
      visible={isEditModal}
      width={900}
      centered
      footer={null}
      forceRender={true}
      afterClose={() => {
        // console.log(defaultFileList);
        form.resetFields();
      }}
      onCancel={onCancel}
    >
      <Form
        colon={false}
        form={form}
        layout="vertical"
        requiredMark={true}
        initialValues={initalValue}
        labelWrap
        onFinish={(values) => onFinish(values)}
      >
        <Col lg={{ span: 24 }} xs={{ span: 24 }}>
          <Form.Item
            label="Ti??u ?????"
            name="title"
            rules={[
              {
                required: true,
                message: 'C???n nh???p t??n s???n ph???m!',
              },
            ]}
          >
            <Input />
          </Form.Item>
        </Col>
        <Col lg={{ span: 24 }} xs={{ span: 24 }}>
          <Form.Item
            label="Gi??"
            name="listPrice"
            style={{ width: '100%' }}
            rules={[
              {
                required: true,
                message: 'C???n nh???p gi??',
              },
              {
                type: 'number',
                min: 1000,
                message: 'Gi?? ph???i l???n h??n b???ng 1,000 ?????ng',
              },
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
              }
              parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>
        </Col>
        <Col lg={{ span: 24 }} xs={{ span: 24 }}>
          <Form.Item
            label="Gi?? sale"
            name="salePrice"
            style={{ width: '100%' }}
            rules={[
              {
                required: true,
                message: 'C???n nh???p gi?? sale',
              },
              {
                type: 'number',
                min: 1000,
                message: 'Gi?? sale ph???i l???n h??n b???ng 1,000 ?????ng',
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  console.log(
                    'test: ',
                    getFieldValue('listPrice'),
                    value,
                    getFieldValue('listPrice') > value
                  );
                  if (!value || getFieldValue('listPrice') > value) {
                    return Promise.resolve();
                  }
                  if (getFieldValue('listPrice') === undefined) {
                    return Promise.reject(new Error('C???n nh???p gi?? g???c!'));
                  }
                  return Promise.reject(
                    new Error('Gi?? sale ph???i nh??? h??n gi?? g???c!')
                  );
                },
              }),
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
              }
              parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>
        </Col>
        <Col lg={{ span: 24 }} xs={{ span: 24 }}>
          <Form.Item
            label="S??? l?????ng"
            name="quantity"
            rules={[
              {
                required: true,
                message: 'C???n nh???p s??? l?????ng s???n ph???m!',
              },
              {
                type: 'number',
                min: 1,
                message: 'S??? l?????ng ph???i l???n h??n ho???c b???ng 1',
              },
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
              }
              parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>
        </Col>
        <Col lg={{ span: 24 }} xs={{ span: 24 }}>
          <Form.Item label="?????c bi???t" name="feartured" valuePropName="checked">
            <Checkbox>?????c bi???t</Checkbox>
          </Form.Item>
        </Col>
        <Col lg={{ span: 24 }} xs={{ span: 24 }}>
          <Form.Item label="Tr???ng th??i" name="status" valuePropName="checked">
            <Checkbox>Tr???ng th??i</Checkbox>
          </Form.Item>
        </Col>
        <Col lg={{ span: 24 }} xs={{ span: 24 }}>
          <Form.Item
            label="Lo???i"
            name="category"
            rules={[
              {
                required: true,
                message: 'C???n ch???n lo???i !',
              },
            ]}
          >
            <Select
              placeholder="H??y ch???n th??? lo???i"
              options={categoryOptions}
            ></Select>
          </Form.Item>
        </Col>
        <Row gutter={[16, 0]}>
          <Col lg={{ span: 5 }}>
            <Form.Item
              label="T??c gi???"
              name={['briefInformation', 'author']}
              rules={[
                {
                  required: true,
                  message: 'C???n nh???p th??ng tin t??c gi???!',
                },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col lg={{ span: 5 }}>
            <Form.Item
              label="Nh?? s???n xu???t"
              name={['briefInformation', 'publisher']}
              rules={[
                {
                  required: true,
                  message: 'C???n nh???p th??ng tin nh?? s???n xu???t',
                },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col lg={{ span: 5 }}>
            <Form.Item
              label="Ng??y s???n xu???t"
              name={['briefInformation', 'publicDate']}
              rules={[
                {
                  required: true,
                  message: 'C???n ch???n ng??y xu???t b???n',
                },
              ]}
            >
              <DatePicker placeholder={'Ch???n ng??y'} format={'DD-MM-YYYY'} />
            </Form.Item>
          </Col>
          <Col lg={{ span: 5 }}>
            <Form.Item
              label="Ng??n ng???"
              name={['briefInformation', 'language']}
              initialValue={`Ti???ng vi???t`}
              rules={[
                {
                  required: true,
                  message: 'C???n ch???n ng??n ng???',
                },
              ]}
            >
              <Select>
                <Option value="Ti???ng Vi???t">Ti???ng Vi???t</Option>
                <Option value="N?????c ngo??i">N?????c ngo??i</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col lg={{ span: 4 }}>
            <Form.Item
              label="S??? trang"
              name={['briefInformation', 'pages']}
              rules={[
                {
                  required: true,
                  message: 'C???n nh???p s??? trang',
                },
                {
                  type: 'number',
                  min: 1,
                  message: 'S??? trang ph???i l???n h??n ho???c b???ng 1',
                },
              ]}
            >
              <InputNumber />
            </Form.Item>
          </Col>
        </Row>
        <Col lg={{ span: 24 }} xs={{ span: 24 }}>
          <Form.Item
            label="M?? t???"
            name="description"
            rules={[
              {
                required: true,
                message: 'C???n nh???p m?? t???',
              },
            ]}
          >
            <TextArea showCount maxLength={256} />
          </Form.Item>
        </Col>
        <Col lg={{ span: 24 }} xs={{ span: 24 }}>
          <Form.Item
            name="thumbnail"
            label={'Thumbnail'}
            getValueFromEvent={normFile}
            style={{ width: '100%' }}
          >
            <Upload
              accept="image/*"
              maxCount={1}
              className="UploadImage"
              listType="picture-card"
              onChange={handleChange}
              defaultFileList={defaultFileList}
              beforeUpload={(file) => {
                beforeUpload(file);
              }}
              showUploadList={true}
              customRequest={fakeUpload}
              onRemove={onRemove}
            >
              {uploadButton}
            </Upload>
          </Form.Item>
        </Col>
        <div
          className="ant-modal-footer"
          style={{ marginLeft: -24, marginRight: -24, marginBottom: -24 }}
        >
          <Row gutter={24} type="flex" style={{ textAlign: 'right' }}>
            <Col
              className="gutter-row"
              span={24}
              style={{ textAlign: 'right' }}
            >
              <Button
                type="clear"
                onClick={onCancel}
                style={{ fontWeight: 'bold' }}
              >
                {'Cancel'}
              </Button>
              {loading === false ? (
                <Button
                  type="primary"
                  htmlType="submit"
                  style={{ fontWeight: 'bold' }}
                >
                  {'Save'}
                </Button>
              ) : (
                <Button type="primary" loading style={{ fontWeight: 'bold' }}>
                  {'Loading'}
                </Button>
              )}
            </Col>
          </Row>
        </div>
      </Form>
    </Modal>
  );
};

export default ProductEdit;
