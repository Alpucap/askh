---
title: KSQL / ksqlDB Basics
---

# KSQL / ksqlDB Basics

## Overview

**ksqlDB** (formerly KSQL) is a database purpose-built for stream processing applications on top of Apache Kafka. It provides a SQL-like interface for processing streams and tables in real-time.

### Key Characteristics
- **Event streaming database**: Combines the power of stream processing with familiar SQL syntax
- **Built on Kafka**: Leverages Kafka Streams under the hood
- **Real-time processing**: Processes data as it arrives
- **Stateful**: Can maintain state across events
- **Scalable**: Horizontally scalable architecture

---

## Architecture

### Components

1. **ksqlDB Server**
   - Executes queries and processes streams
   - Runs as a cluster of nodes
   - Built on Kafka Streams

2. **ksqlDB CLI**
   - Command-line interface for interactive queries
   - Connects to ksqlDB server

3. **REST API**
   - HTTP interface for programmatic access
   - Used by CLI and applications

### Processing Models

- **Interactive queries**: Ad-hoc queries for exploration
- **Persistent queries**: Long-running queries that continuously process streams
- **Push queries**: Stream results as they arrive
- **Pull queries**: Query materialized views (point-in-time snapshots)

---

## Core Concepts

### Streams

A **stream** is an unbounded sequence of structured data (events). Each event is immutable.

**Characteristics:**
- Append-only
- Each record has a key and value
- Timestamped events
- Represents facts/events (e.g., "user clicked button")

**Creating a Stream:**
```sql
CREATE STREAM pageviews (
  viewtime BIGINT,
  userid VARCHAR,
  pageid VARCHAR
) WITH (
  KAFKA_TOPIC='pageviews-topic',
  VALUE_FORMAT='JSON',
  PARTITIONS=4
);
```

### Tables

A **table** is a collection of evolving facts. Each row is mutable and represents the current state.

**Characteristics:**
- Updates allowed (via key)
- Represents state/entities (e.g., "user profile")
- Latest value per key is maintained
- Backed by a compacted Kafka topic

**Creating a Table:**
```sql
CREATE TABLE users (
  userid VARCHAR PRIMARY KEY,
  registertime BIGINT,
  gender VARCHAR,
  regionid VARCHAR
) WITH (
  KAFKA_TOPIC='users-topic',
  VALUE_FORMAT='JSON'
);
```

### Stream vs Table

| Aspect | Stream | Table |
|--------|--------|-------|
| Nature | Immutable events | Mutable state |
| Updates | Append-only | Upsert (update/insert) |
| Semantics | Changelog | Current state |
| Example | Click events | User profiles |

---

## Data Types

### Primitive Types
- `BOOLEAN`
- `INT` / `INTEGER`
- `BIGINT`
- `DOUBLE`
- `VARCHAR` / `STRING`
- `DECIMAL(precision, scale)`

### Complex Types
- `ARRAY<ElementType>`: `ARRAY<VARCHAR>`
- `MAP<KeyType, ValueType>`: `MAP<VARCHAR, INT>`
- `STRUCT<field1 Type1, field2 Type2>`: `STRUCT<name VARCHAR, age INT>`

### Special Types
- `TIMESTAMP`: Milliseconds since epoch
- `TIME`: Time of day
- `DATE`: Calendar date
- `BYTES`: Raw binary data

---

## Creating Streams and Tables

### CREATE STREAM

```sql
CREATE STREAM stream_name (
  column1 TYPE,
  column2 TYPE,
  ...
) WITH (
  KAFKA_TOPIC='topic-name',
  VALUE_FORMAT='format',
  [additional properties]
);
```

### CREATE TABLE

```sql
CREATE TABLE table_name (
  key_column TYPE PRIMARY KEY,
  column1 TYPE,
  column2 TYPE,
  ...
) WITH (
  KAFKA_TOPIC='topic-name',
  VALUE_FORMAT='format',
  [additional properties]
);
```

### WITH Clause Properties

Common properties:
- `KAFKA_TOPIC`: Underlying Kafka topic name
- `VALUE_FORMAT`: Format of message values (`JSON`, `AVRO`, `PROTOBUF`, `DELIMITED`)
- `KEY_FORMAT`: Format of message keys
- `PARTITIONS`: Number of partitions (for new topics)
- `REPLICAS`: Replication factor
- `TIMESTAMP`: Column to use for event time
- `TIMESTAMP_FORMAT`: Format string for timestamp parsing
- `WRAP_SINGLE_VALUE`: Whether to wrap single-column values

**Example:**
```sql
CREATE STREAM orders (
  orderid INT,
  itemid VARCHAR,
  orderunits DOUBLE,
  timestamp VARCHAR
) WITH (
  KAFKA_TOPIC='orders',
  VALUE_FORMAT='JSON',
  TIMESTAMP='timestamp',
  TIMESTAMP_FORMAT='yyyy-MM-dd HH:mm:ss'
);
```

---

## Querying Data

### SELECT Queries

#### Transient Query (Push Query)
Returns continuous stream of results:

```sql
SELECT * FROM pageviews EMIT CHANGES;
```

#### Persistent Query
Creates a new stream/table from query results:

```sql
CREATE STREAM pageviews_female AS
  SELECT * FROM pageviews
  WHERE gender = 'FEMALE'
  EMIT CHANGES;
```

### Common Query Patterns

#### Filtering
```sql
SELECT * FROM orders
WHERE orderunits > 5
EMIT CHANGES;
```

#### Projection
```sql
SELECT orderid, itemid, orderunits * 10 AS total
FROM orders
EMIT CHANGES;
```

#### Aggregations
```sql
SELECT regionid, COUNT(*) AS view_count
FROM pageviews
GROUP BY regionid
EMIT CHANGES;
```

#### Time Windows
```sql
SELECT userid,
       COUNT(*) AS view_count
FROM pageviews
WINDOW TUMBLING (SIZE 5 MINUTES)
GROUP BY userid
EMIT CHANGES;
```

---

## Windowing

### Window Types

#### 1. Tumbling Window
Fixed-size, non-overlapping, gap-less windows.

```sql
SELECT userid, COUNT(*)
FROM pageviews
WINDOW TUMBLING (SIZE 1 HOUR)
GROUP BY userid
EMIT CHANGES;
```

#### 2. Hopping Window
Fixed-size, overlapping windows.

```sql
SELECT userid, COUNT(*)
FROM pageviews
WINDOW HOPPING (SIZE 1 HOUR, ADVANCE BY 30 MINUTES)
GROUP BY userid
EMIT CHANGES;
```

#### 3. Session Window
Dynamically-sized windows based on activity gaps.

```sql
SELECT userid, COUNT(*)
FROM pageviews
WINDOW SESSION (60 MINUTES)
GROUP BY userid
EMIT CHANGES;
```

### Window Bounds

- `WINDOWSTART`: Start time of window
- `WINDOWEND`: End time of window

```sql
SELECT WINDOWSTART, WINDOWEND, userid, COUNT(*) AS count
FROM pageviews
WINDOW TUMBLING (SIZE 5 MINUTES)
GROUP BY userid
EMIT CHANGES;
```

---

## Joins

### Stream-Stream Join

Join two streams within a time window:

```sql
CREATE STREAM orders_enriched AS
  SELECT o.orderid,
         o.itemid,
         p.pageid,
         p.userid
  FROM orders o
  INNER JOIN pageviews p
    WITHIN 1 HOUR
    ON o.userid = p.userid
  EMIT CHANGES;
```

**Join Types:**
- `INNER JOIN`: Only matching records
- `LEFT JOIN`: All from left, matching from right
- `OUTER JOIN`: All records from both

### Stream-Table Join

Enrich stream with table data:

```sql
CREATE STREAM pageviews_enriched AS
  SELECT pv.viewtime,
         pv.userid,
         pv.pageid,
         u.gender,
         u.regionid
  FROM pageviews pv
  LEFT JOIN users u
    ON pv.userid = u.userid
  EMIT CHANGES;
```

### Table-Table Join

Join two tables (foreign key join):

```sql
CREATE TABLE user_region AS
  SELECT u.userid,
         u.gender,
         r.region_name
  FROM users u
  LEFT JOIN regions r
    ON u.regionid = r.regionid
  EMIT CHANGES;
```

---

## Aggregation Functions

### Count Functions
- `COUNT(*)`: Count all rows
- `COUNT(column)`: Count non-null values
- `COUNT_DISTINCT(column)`: Count unique values

### Numeric Aggregations
- `SUM(column)`
- `AVG(column)` / `MEAN(column)`
- `MIN(column)`
- `MAX(column)`

### Collection Functions
- `COLLECT_LIST(column)`: Collect values into array
- `COLLECT_SET(column)`: Collect unique values into array

### Statistical Functions
- `STDDEV_SAMP(column)`: Sample standard deviation
- `STDDEV_POP(column)`: Population standard deviation

**Example:**
```sql
SELECT regionid,
       COUNT(*) AS count,
       SUM(orderunits) AS total_units,
       AVG(orderunits) AS avg_units,
       COLLECT_LIST(itemid) AS items
FROM orders
GROUP BY regionid
EMIT CHANGES;
```

---

## Scalar Functions

### String Functions
- `CONCAT(str1, str2, ...)`: Concatenate strings
- `UCASE(str)` / `LCASE(str)`: Upper/lowercase
- `SUBSTRING(str, pos, len)`: Extract substring
- `TRIM(str)`: Remove whitespace
- `LEN(str)`: String length
- `REPLACE(str, search, replace)`: Replace text
- `SPLIT(str, delimiter)`: Split into array

### Math Functions
- `ABS(num)`: Absolute value
- `CEIL(num)` / `FLOOR(num)`: Round up/down
- `ROUND(num, [decimals])`: Round to decimals
- `RANDOM()`: Random number
- `SQRT(num)`: Square root

### Date/Time Functions
- `TIMESTAMPTOSTRING(timestamp, format)`: Format timestamp
- `STRINGTOTIMESTAMP(str, format)`: Parse timestamp
- `FORMAT_TIMESTAMP(timestamp, format)`: Format timestamp
- `PARSE_TIMESTAMP(str, format)`: Parse timestamp
- `DATETOSTRING(date, format)`: Format date
- `STRINGTODATE(str, format)`: Parse date

### Type Conversion
- `CAST(expr AS type)`: Convert type
- `CAST(orderid AS STRING)`

### Conditional
- `CASE WHEN condition THEN result ... END`
- `COALESCE(expr1, expr2, ...)`: First non-null value

**Example:**
```sql
SELECT orderid,
       CASE
         WHEN orderunits < 5 THEN 'Small'
         WHEN orderunits < 10 THEN 'Medium'
         ELSE 'Large'
       END AS order_size,
       CONCAT('Order #', CAST(orderid AS STRING)) AS order_label
FROM orders
EMIT CHANGES;
```

---

## Array and Map Operations

### Array Functions
- `ARRAY[val1, val2, ...]`: Create array
- `ARRAY_CONTAINS(array, value)`: Check if contains
- `ARRAY_LENGTH(array)`: Get length
- `ARRAY_DISTINCT(array)`: Remove duplicates
- `ARRAY_JOIN(array, delimiter)`: Join to string
- `ARRAY_SORT(array)`: Sort array
- `ARRAY_MAX(array)` / `ARRAY_MIN(array)`: Get max/min

### Map Functions
- `MAP(key1, val1, key2, val2, ...)`: Create map
- `MAP_KEYS(map)`: Get all keys as array
- `MAP_VALUES(map)`: Get all values as array
- `map[key]`: Access value by key

### Struct Operations
Access struct fields with dot notation:
```sql
SELECT address.street, address.city
FROM users
EMIT CHANGES;
```

---

## Pull Queries

Pull queries allow you to query materialized views (tables) for point-in-time results.

### Requirements
- Must query a materialized table
- Must include WHERE clause with key equality

**Example:**
```sql
-- Create materialized table
CREATE TABLE user_clicks AS
  SELECT userid, COUNT(*) AS click_count
  FROM clickstream
  GROUP BY userid
  EMIT CHANGES;

-- Pull query
SELECT * FROM user_clicks
WHERE userid = 'User_1';
```

### Multi-key Lookup
```sql
SELECT * FROM user_clicks
WHERE userid IN ('User_1', 'User_2', 'User_3');
```

---

## Managing Queries

### List Queries
```sql
SHOW QUERIES;
```

### Describe Query
```sql
DESCRIBE EXTENDED query_id;
```

### Explain Query
```sql
EXPLAIN query_id;
```

### Terminate Query
```sql
TERMINATE query_id;
```

### Terminate All Queries
```sql
TERMINATE ALL;
```

---

## Schema Management

### Show Topics
```sql
SHOW TOPICS;
```

### Show Streams
```sql
SHOW STREAMS;
```

### Show Tables
```sql
SHOW TABLES;
```

### Describe Stream/Table
```sql
DESCRIBE stream_name;
DESCRIBE EXTENDED table_name;
```

### Drop Stream/Table
```sql
DROP STREAM stream_name;
DROP TABLE table_name;

-- Delete the underlying topic too
DROP STREAM stream_name DELETE TOPIC;
```

---

## Data Formats

### JSON
```sql
CREATE STREAM events (
  id INT,
  message VARCHAR
) WITH (
  KAFKA_TOPIC='events',
  VALUE_FORMAT='JSON'
);
```

### AVRO
Requires Schema Registry:
```sql
CREATE STREAM events (
  id INT,
  message VARCHAR
) WITH (
  KAFKA_TOPIC='events',
  VALUE_FORMAT='AVRO'
);
```

### PROTOBUF
```sql
CREATE STREAM events WITH (
  KAFKA_TOPIC='events',
  VALUE_FORMAT='PROTOBUF'
);
```

### DELIMITED (CSV)
```sql
CREATE STREAM events (
  id INT,
  message VARCHAR
) WITH (
  KAFKA_TOPIC='events',
  VALUE_FORMAT='DELIMITED',
  VALUE_DELIMITER='|'
);
```

---

## User-Defined Functions (UDFs)

### Creating UDFs

Write Java function:
```java
@UdfDescription(name = "multiply", description = "Multiply two numbers")
public class MultiplyUdf {
  @Udf(description = "multiply two ints")
  public long multiply(
    @UdfParameter(value = "V1") final int v1,
    @UdfParameter(value = "V2") final int v2
  ) {
    return v1 * v2;
  }
}
```

### Deploying UDFs
1. Package as JAR
2. Place in ksqlDB extensions directory
3. Restart ksqlDB server

### Using UDFs
```sql
SELECT orderid, MULTIPLY(orderunits, 100) AS total
FROM orders
EMIT CHANGES;
```

---

## INSERT INTO

Insert values from one stream/table into another:

```sql
CREATE STREAM high_value_orders AS
  SELECT * FROM orders
  WHERE orderunits > 100
  EMIT CHANGES;

-- Insert additional data
INSERT INTO high_value_orders
  SELECT * FROM premium_orders
  EMIT CHANGES;
```

Insert explicit values:
```sql
INSERT INTO users (userid, name, email)
VALUES ('user123', 'John Doe', 'john@example.com');
```

---

## Connectors

ksqlDB can create and manage Kafka Connect connectors.

### Create Source Connector
```sql
CREATE SOURCE CONNECTOR jdbc_source WITH (
  'connector.class' = 'io.confluent.connect.jdbc.JdbcSourceConnector',
  'connection.url' = 'jdbc:postgresql://localhost:5432/mydb',
  'mode' = 'incrementing',
  'incrementing.column.name' = 'id',
  'topic.prefix' = 'jdbc-',
  'table.whitelist' = 'users'
);
```

### Create Sink Connector
```sql
CREATE SINK CONNECTOR elastic_sink WITH (
  'connector.class' = 'io.confluent.connect.elasticsearch.ElasticsearchSinkConnector',
  'connection.url' = 'http://localhost:9200',
  'topics' = 'pageviews_enriched'
);
```

### Manage Connectors
```sql
SHOW CONNECTORS;
DESCRIBE CONNECTOR connector_name;
DROP CONNECTOR connector_name;
```

---

## Advanced Features

### PARTITION BY

Repartition a stream:
```sql
CREATE STREAM orders_by_region AS
  SELECT * FROM orders
  PARTITION BY regionid
  EMIT CHANGES;
```

### HEADERS

Access Kafka message headers:
```sql
CREATE STREAM events (
  id INT,
  HEADER('source') source VARCHAR
) WITH (
  KAFKA_TOPIC='events',
  VALUE_FORMAT='JSON'
);
```

### ROWTIME and ROWKEY

- `ROWTIME`: Event timestamp
- `ROWKEY`: Message key (deprecated, use column with KEY)

```sql
CREATE STREAM events (
  id INT KEY,
  event_time TIMESTAMP
) WITH (
  KAFKA_TOPIC='events',
  VALUE_FORMAT='JSON',
  TIMESTAMP='event_time'
);
```

### Latest By Offset

Get latest value per key from a stream:
```sql
CREATE TABLE latest_values AS
  SELECT id,
         LATEST_BY_OFFSET(value) AS latest_value
  FROM events
  GROUP BY id
  EMIT CHANGES;
```

---

## Configuration

### Server Properties

Key `ksql-server.properties` settings:
```properties
# Listeners
listeners=http://0.0.0.0:8088

# Bootstrap servers
bootstrap.servers=localhost:9092

# State directory
ksql.streams.state.dir=/var/lib/ksql

# Processing guarantee
processing.guarantee=exactly_once

# Auto offset reset
ksql.streams.auto.offset.reset=earliest

# Cache size
ksql.streams.cache.max.bytes.buffering=10000000
```

### Session Properties

Set for current session:
```sql
SET 'auto.offset.reset' = 'earliest';
SET 'commit.interval.ms' = '1000';
```

Show current properties:
```sql
SHOW PROPERTIES;
```

Unset property:
```sql
UNSET 'auto.offset.reset';
```

---

## Performance Tuning

### Query Optimization

1. **Filter Early**: Apply WHERE clauses as early as possible
2. **Use Appropriate Keys**: Ensure proper key selection for joins
3. **Limit State Size**: Use windowing to bound state
4. **Choose Right Window Size**: Balance latency and accuracy

### Resource Configuration

```sql
-- Set number of threads
SET 'ksql.streams.num.stream.threads' = '4';

-- Set cache size
SET 'ksql.streams.cache.max.bytes.buffering' = '10000000';

-- Set commit interval
SET 'ksql.streams.commit.interval.ms' = '1000';
```

### Scaling

- **Scale out**: Add more ksqlDB servers to the cluster
- **Increase partitions**: More partitions = more parallelism
- **Co-locate**: Co-locate ksqlDB with Kafka brokers for lower latency

---

## Best Practices

### Schema Design
- Use meaningful column names
- Choose appropriate data types
- Consider future schema evolution
- Use AVRO for schema enforcement

### Query Design
- Start with simple queries, iterate to complexity
- Test with small datasets first
- Use EXPLAIN to understand query execution
- Monitor query performance

### Key Selection
- Choose keys that distribute data evenly
- Keys should be immutable
- Consider query patterns when selecting keys

### State Management
- Use windowing to bound state size
- Monitor state store sizes
- Consider retention requirements
- Clean up old queries

### Operations
- Monitor query lag
- Set up alerting for failed queries
- Regular backups of configurations
- Document query purposes

---

## Common Patterns

### Sessionization
Track user sessions based on activity:

```sql
CREATE TABLE user_sessions AS
  SELECT userid,
         WINDOWSTART AS session_start,
         WINDOWEND AS session_end,
         COUNT(*) AS event_count
  FROM clickstream
  WINDOW SESSION (30 MINUTES)
  GROUP BY userid
  EMIT CHANGES;
```

### Deduplication
Remove duplicate events:

```sql
CREATE TABLE unique_events AS
  SELECT id,
         LATEST_BY_OFFSET(data) AS data
  FROM events
  GROUP BY id
  EMIT CHANGES;
```

### Change Data Capture (CDC)
Track changes to tables:

```sql
CREATE TABLE user_changes AS
  SELECT userid,
         LATEST_BY_OFFSET(name) AS current_name,
         LATEST_BY_OFFSET(email) AS current_email
  FROM user_updates
  GROUP BY userid
  EMIT CHANGES;
```

### Alerting
Generate alerts based on conditions:

```sql
CREATE STREAM high_value_alerts AS
  SELECT orderid, orderunits, timestamp
  FROM orders
  WHERE orderunits > 1000
  EMIT CHANGES;
```

### Aggregation with Multiple Time Windows
```sql
CREATE TABLE pageview_stats AS
  SELECT userid,
         WINDOWSTART AS window_start,
         COUNT(*) AS view_count,
         COUNT_DISTINCT(pageid) AS unique_pages
  FROM pageviews
  WINDOW TUMBLING (SIZE 1 HOUR)
  GROUP BY userid
  EMIT CHANGES;
```

---

## Troubleshooting

### Common Issues

#### Query Not Producing Results
- Check if source topic has data
- Verify offset reset setting: `SET 'auto.offset.reset' = 'earliest';`
- Check for errors: `DESCRIBE EXTENDED query_id;`

#### Performance Issues
- Check query plan: `EXPLAIN query_id;`
- Monitor consumer lag
- Increase parallelism (more threads/partitions)
- Review window sizes and state store sizes

#### Join Issues
- Verify both streams/tables have data
- Check key compatibility (must be same type)
- For stream-stream joins, ensure WITHIN clause is appropriate
- Verify co-partitioning (same number of partitions, same partitioning scheme)

#### Schema Errors
- Ensure topic data matches declared schema
- For AVRO, verify Schema Registry connectivity
- Check VALUE_FORMAT matches actual data format

### Debugging Commands

```sql
-- Print topic data
PRINT 'topic-name' FROM BEGINNING;

-- Print with limit
PRINT 'topic-name' FROM BEGINNING LIMIT 10;

-- Print with interval
PRINT 'topic-name' FROM BEGINNING INTERVAL 2;

-- Check query details
DESCRIBE EXTENDED query_id;
EXPLAIN query_id;

-- Check metrics
SHOW QUERIES;
```

---

## CLI Commands

### Starting CLI
```bash
ksql http://localhost:8088
```

### Command Options
```bash
# Run script file
ksql http://localhost:8088 --file queries.sql

# Execute single command
ksql http://localhost:8088 --execute "SHOW STREAMS;"

# Output format
ksql http://localhost:8088 --output JSON
```

### Interactive Commands
```sql
-- Help
HELP;

-- Clear screen
CLEAR;

-- Exit
EXIT;

-- Run external script
RUN SCRIPT '/path/to/script.sql';
```

---

## REST API

### Query Endpoint
```bash
curl -X POST http://localhost:8088/query \
  -H "Content-Type: application/vnd.ksql.v1+json" \
  -d '{
    "ksql": "SELECT * FROM pageviews EMIT CHANGES;",
    "streamsProperties": {}
  }'
```

### Execute Statement
```bash
curl -X POST http://localhost:8088/ksql \
  -H "Content-Type: application/vnd.ksql.v1+json" \
  -d '{
    "ksql": "CREATE STREAM my_stream ...",
    "streamsProperties": {}
  }'
```

### Server Info
```bash
curl http://localhost:8088/info
```

### Cluster Status
```bash
curl http://localhost:8088/clusterStatus
```

---

## Security

### Authentication

ksqlDB supports authentication via:
- Basic authentication
- SSL/TLS
- SASL (PLAIN, SCRAM, GSSAPI)

### Authorization

Configure ACLs for:
- Topic access (read/write)
- Consumer groups
- Transactional IDs

### Encryption

Enable SSL for:
- Client-to-server communication
- Server-to-Kafka communication

**Configuration:**
```properties
# SSL
security.protocol=SSL
ssl.truststore.location=/path/to/truststore.jks
ssl.truststore.password=password
ssl.keystore.location=/path/to/keystore.jks
ssl.keystore.password=password
ssl.key.password=password
```

---

## Monitoring

### Metrics

Key metrics to monitor:
- **Query metrics**: Messages processed, error rate
- **Consumer lag**: How far behind queries are
- **State store size**: Memory/disk usage
- **Throughput**: Messages per second
- **Latency**: Processing time

### JMX Metrics

ksqlDB exposes metrics via JMX:
```
kafka.streams:type=stream-metrics,client-id=*
kafka.streams:type=stream-task-metrics,client-id=*
```

### Logging

Configure logging in `log4j.properties`:
```properties
log4j.rootLogger=INFO, stdout
log4j.logger.io.confluent.ksql=DEBUG
```

---

## Migration from KSQL to ksqlDB

### Key Differences

1. **Name**: KSQL → ksqlDB
2. **Pull queries**: Enhanced support in ksqlDB
3. **Connectors**: Native connector management in ksqlDB
4. **Performance**: Improved query optimization

### Migration Steps

1. Upgrade servers to ksqlDB version
2. Test queries in new environment
3. Update client applications if using API
4. Review and update configurations
5. Monitor performance after migration

---

## Resources

### Official Documentation
- [ksqlDB Documentation](https://docs.ksqldb.io/)
- [ksqlDB GitHub](https://github.com/confluentinc/ksql)
- [Confluent Platform Documentation](https://docs.confluent.io/)

### Community
- [Confluent Community Slack](https://www.confluent.io/slack)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/ksql)

### Tutorials
- ksqlDB Tutorials
- Confluent Developer Portal
- Kafka Streams documentation (underlying engine)

---

## Example Use Cases

### Real-Time Analytics Dashboard
```sql
-- Stream of user events
CREATE STREAM user_events (
  user_id VARCHAR,
  event_type VARCHAR,
  page VARCHAR,
  timestamp BIGINT
) WITH (
  KAFKA_TOPIC='user_events',
  VALUE_FORMAT='JSON'
);

-- 5-minute rolling counts
CREATE TABLE event_counts AS
  SELECT event_type,
         COUNT(*) AS count,
         WINDOWSTART AS window_start
  FROM user_events
  WINDOW TUMBLING (SIZE 5 MINUTES)
  GROUP BY event_type
  EMIT CHANGES;
```

### Fraud Detection
```sql
-- Stream of transactions
CREATE STREAM transactions (
  transaction_id VARCHAR,
  user_id VARCHAR,
  amount DOUBLE,
  merchant VARCHAR,
  timestamp BIGINT
) WITH (
  KAFKA_TOPIC='transactions',
  VALUE_FORMAT='JSON'
);

-- Detect high-value transactions in short time
CREATE STREAM potential_fraud AS
  SELECT user_id,
         SUM(amount) AS total_amount,
         COUNT(*) AS transaction_count,
         COLLECT_LIST(merchant) AS merchants
  FROM transactions
  WINDOW SESSION (5 MINUTES)
  GROUP BY user_id
  HAVING SUM(amount) > 5000
  EMIT CHANGES;
```

### IoT Sensor Monitoring
```sql
-- Stream of sensor readings
CREATE STREAM sensor_data (
  sensor_id VARCHAR,
  temperature DOUBLE,
  humidity DOUBLE,
  timestamp BIGINT
) WITH (
  KAFKA_TOPIC='sensor_readings',
  VALUE_FORMAT='JSON'
);

-- Alert on abnormal readings
CREATE STREAM temperature_alerts AS
  SELECT sensor_id,
         temperature,
         timestamp
  FROM sensor_data
  WHERE temperature > 100 OR temperature < -20
  EMIT CHANGES;

-- Aggregate sensor statistics
CREATE TABLE sensor_stats AS
  SELECT sensor_id,
         AVG(temperature) AS avg_temp,
         MIN(temperature) AS min_temp,
         MAX(temperature) AS max_temp,
         WINDOWSTART AS window_start
  FROM sensor_data
  WINDOW TUMBLING (SIZE 1 HOUR)
  GROUP BY sensor_id
  EMIT CHANGES;
```

---

## Quick Reference

### Common Commands
```sql
-- Show all
SHOW TOPICS;
SHOW STREAMS;
SHOW TABLES;
SHOW QUERIES;
SHOW CONNECTORS;

-- Describe
DESCRIBE stream_name;
DESCRIBE EXTENDED table_name;

-- Create
CREATE STREAM ...
CREATE TABLE ...
CREATE CONNECTOR ...

-- Query
SELECT ... EMIT CHANGES;

-- Insert
INSERT INTO ...

-- Drop
DROP STREAM stream_name;
DROP TABLE table_name;
TERMINATE query_id;

-- Print topic
PRINT 'topic-name' FROM BEGINNING;
```

### Key Syntax Patterns
```sql
-- Persistent query
CREATE STREAM/TABLE name AS SELECT ... EMIT CHANGES;

-- Filter
WHERE condition

-- Join
FROM stream1 JOIN stream2 ON condition

-- Window
WINDOW TUMBLING/HOPPING/SESSION (...)

-- Group
GROUP BY column

-- Having
HAVING condition
```

---

This completes the comprehensive notes on ksqlDB. The technology continues to evolve, so always refer to the official documentation for the latest features and best practices.