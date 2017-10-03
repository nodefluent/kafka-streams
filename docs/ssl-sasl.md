SSL, SASL and Kerberos Support
==============================

- SSL, SASL and Kerberos support is available when
    you are using the [native client](native.md)
    enabling it, is just a matter of configuration parameters,
    you can find a configuration [example here](https://github.com/nodefluent/node-sinek/tree/master/sasl-ssl-example)

- SSL support is also available in the Javascript client
    you can find a configuration [example here](https://github.com/nodefluent/node-sinek/tree/master/ssl-example)

- the examples above (in the sinek github project) also ship
    with a local (docker based) kafka-setup that can be used to
    understand how the brokers must be configured to support SSL, SASL or Kerberos
    [sinek kafka-setup](https://github.com/nodefluent/node-sinek/tree/master/kafka-setup)
