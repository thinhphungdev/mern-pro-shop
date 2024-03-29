import { Link, useParams } from 'react-router-dom';
import { Row, Col, ListGroup, Image, Card, Button } from 'react-bootstrap';
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { toast } from 'react-toastify';
import Message from '../components/Message';
import Loader from '../components/Loader';
import { useOrderDetails } from '../hooks/index';
import { useBoundStore } from '../store/index';
import { shallow } from 'zustand/shallow';

const OrderScreen = () => {
  const { id: orderId } = useParams();

  const {
    orderDetails: order,
    error,
    isLoading,
    refetch: refetchOrder,
  } = useOrderDetails(orderId);

  const {
    userInfo,
    isPayOrderLoading,
    payOrder,
    deliverOrder,
    isDeliverOrderLoading,
  } = useBoundStore(
    (store) => ({
      userInfo: store.userInfo,
      isPayOrderLoading: store.isPayOrderLoading,
      payOrder: store.payOrder,
      deliverOrder: store.deliverOrder,
      isDeliverOrderLoading: store.isDeliverOrderLoading,
    }),
    shallow
  );

  const isAdminUser = userInfo && userInfo.isAdmin;

  const [{ isPending }, dispatch] = usePayPalScriptReducer();

  function onApprove(data, actions) {
    return actions.order.capture().then(async function (details) {
      try {
        await payOrder({ orderId, details });
        refetchOrder((prevState) => !prevState);
        toast.success('Order is paid');
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    });
  }
  // TESTING ONLY! REMOVE BEFORE PRODUCTION
  async function onApproveTest() {
    await payOrder({ orderId, details: { payer: {} } });
    refetchOrder((prevState) => !prevState);

    toast.success('Order is paid');
  }
  function createOrder(data, actions) {
    return actions.order
      .create({
        purchase_units: [
          {
            amount: { value: order.totalPrice },
          },
        ],
      })
      .then((orderID) => orderID);
  }

  async function deliverOrderHandler(orderId) {
    try {
      await deliverOrder(orderId);
      refetchOrder((prevState) => !prevState);
      toast.success('Order delivered successfully');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  }

  function onError(err) {
    toast.error(err.message);
  }

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return <Message variant='danger'>{error?.message}</Message>;
  }

  function onError(err) {
    toast.error(err.message);
  }

  return (
    <>
      <h1>Order {order?._id}</h1>
      <Row>
        <Col md={8}>
          <ListGroup variant='flush'>
            <ListGroup.Item>
              <h2>Shipping</h2>
              <p>
                <strong>Name: </strong> {order?.user.name}
              </p>
              <p>
                <strong>Email: </strong>{' '}
                <a href={`mailto:${order?.user.email}`}>{order?.user.email}</a>
              </p>
              <p>
                <strong>Address:</strong>
                {order?.shippingAddress.address}, {order?.shippingAddress.city}{' '}
                {order?.shippingAddress.postalCode},{' '}
                {order?.shippingAddress.country}
              </p>
              {order?.isDelivered ? (
                <Message variant='success'>
                  Delivered on {order?.deliveredAt}
                </Message>
              ) : (
                <Message variant='danger'>Not Delivered</Message>
              )}
            </ListGroup.Item>

            <ListGroup.Item>
              <h2>Payment Method</h2>
              <p>
                <strong>Method: </strong>
                {order?.paymentMethod}
              </p>
              {order?.isPaid ? (
                <Message variant='success'>Paid on {order.paidAt}</Message>
              ) : (
                <Message variant='danger'>Not Paid</Message>
              )}
            </ListGroup.Item>

            <ListGroup.Item>
              <h2>Order Items</h2>
              {order?.orderItems.length === 0 ? (
                <Message>Order is empty</Message>
              ) : (
                <ListGroup variant='flush'>
                  {order?.orderItems?.map((item, index) => (
                    <ListGroup.Item key={index}>
                      <Row>
                        <Col md={1}>
                          <Image
                            src={item.image}
                            alt={item.name}
                            fluid
                            rounded
                          />
                        </Col>
                        <Col>
                          <Link to={`/product/${item.product}`}>
                            {item.name}
                          </Link>
                        </Col>
                        <Col md={4}>
                          {item.qty} x ${item.price} = ${item.qty * item.price}
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </ListGroup.Item>
          </ListGroup>
        </Col>
        <Col md={4}>
          <Card>
            <ListGroup variant='flush'>
              <ListGroup.Item>
                <h2>Order Summary</h2>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Items</Col>
                  <Col>${order?.itemsPrice}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Shipping</Col>
                  <Col>${order?.shippingPrice}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Tax</Col>
                  <Col>${order?.taxPrice}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Total</Col>
                  <Col>${order?.totalPrice}</Col>
                </Row>
              </ListGroup.Item>

              {!order?.isPaid && (
                <ListGroup.Item>
                  {isPayOrderLoading && <Loader />}

                  {isPending ? (
                    <Loader />
                  ) : (
                    <div>
                      {/* THIS BUTTON IS FOR TESTING! REMOVE BEFORE PRODUCTION!
                      <Button
                        style={{ marginBottom: '10px' }}
                        onClick={onApproveTest}
                      >
                        Test Pay Order
                      </Button> */}
                      <div>
                        <PayPalButtons
                          style={{ layout: 'vertical' }}
                          createOrder={(data, actions) =>
                            createOrder(data, actions)
                          }
                          onApprove={(data, actions) =>
                            onApprove(data, actions)
                          }
                          onError={onError}
                        />
                      </div>
                    </div>
                  )}
                </ListGroup.Item>
              )}

              {isDeliverOrderLoading && <Loader />}

              {isAdminUser && order?.isPaid && !order.isDelivered && (
                <ListGroup.Item>
                  <Button
                    type='button'
                    className='btn btn-block'
                    onClick={() => deliverOrderHandler(orderId)}
                  >
                    Mark As Delivered
                  </Button>
                </ListGroup.Item>
              )}
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default OrderScreen;
