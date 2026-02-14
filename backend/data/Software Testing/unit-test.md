---
title: Unit Test
---

# Unit Testing

## What is Unit Testing?

Unit Testing is a software testing method where individual units of code (such as methods, classes, or components) are tested separately to ensure they work correctly as expected. In C#, unit tests are typically written using testing frameworks like NUnit, xUnit, or MSTest.

## Popular C# Testing Frameworks

### 1. xUnit.net
- Modern, open-source framework
- Created by the original inventor of NUnit
- Used by .NET Core team
- Constructor for setup, IDisposable for cleanup
- No [SetUp] or [TearDown] attributes

### 2. NUnit
- Mature, widely-used framework
- Similar to JUnit
- Rich assertion library
- Supports parameterized tests
- Good documentation

### 3. MSTest
- Microsoft's testing framework
- Built into Visual Studio
- Good integration with Visual Studio Test Explorer
- Enterprise support

### Framework Comparison

```csharp
// xUnit
public class CalculatorTests
{
    [Fact]
    public void Add_TwoNumbers_ReturnsSum()
    {
        // Test code
    }
    
    [Theory]
    [InlineData(2, 3, 5)]
    [InlineData(0, 0, 0)]
    public void Add_MultipleScenarios(int a, int b, int expected)
    {
        // Test code
    }
}

// NUnit
[TestFixture]
public class CalculatorTests
{
    [Test]
    public void Add_TwoNumbers_ReturnsSum()
    {
        // Test code
    }
    
    [TestCase(2, 3, 5)]
    [TestCase(0, 0, 0)]
    public void Add_MultipleScenarios(int a, int b, int expected)
    {
        // Test code
    }
}

// MSTest
[TestClass]
public class CalculatorTests
{
    [TestMethod]
    public void Add_TwoNumbers_ReturnsSum()
    {
        // Test code
    }
    
    [DataTestMethod]
    [DataRow(2, 3, 5)]
    [DataRow(0, 0, 0)]
    public void Add_MultipleScenarios(int a, int b, int expected)
    {
        // Test code
    }
}
```

## Setting Up Unit Testing in C#

### Installing Testing Frameworks

```bash
# xUnit
dotnet add package xunit
dotnet add package xunit.runner.visualstudio
dotnet add package Microsoft.NET.Test.Sdk

# NUnit
dotnet add package NUnit
dotnet add package NUnit3TestAdapter
dotnet add package Microsoft.NET.Test.Sdk

# MSTest
dotnet add package MSTest.TestFramework
dotnet add package MSTest.TestAdapter
dotnet add package Microsoft.NET.Test.Sdk
```

### Project Structure

```
Solution/
├── MyApp/
│   ├── Services/
│   │   └── Calculator.cs
│   └── Models/
│       └── User.cs
└── MyApp.Tests/
    ├── Services/
    │   └── CalculatorTests.cs
    └── Models/
        └── UserTests.cs
```

## AAA Pattern (Arrange-Act-Assert)

```csharp
[Fact]
public void Add_TwoPositiveNumbers_ReturnsCorrectSum()
{
    // Arrange - Set up test data and dependencies
    var calculator = new Calculator();
    int a = 5;
    int b = 3;
    int expected = 8;
    
    // Act - Execute the method being tested
    int result = calculator.Add(a, b);
    
    // Assert - Verify the result
    Assert.Equal(expected, result);
}
```

## Assertions

### xUnit Assertions

```csharp
// Equality
Assert.Equal(expected, actual);
Assert.NotEqual(expected, actual);

// Boolean
Assert.True(condition);
Assert.False(condition);

// Null checks
Assert.Null(obj);
Assert.NotNull(obj);

// String assertions
Assert.Contains("substring", actualString);
Assert.DoesNotContain("substring", actualString);
Assert.StartsWith("prefix", actualString);
Assert.EndsWith("suffix", actualString);
Assert.Empty(collection);
Assert.NotEmpty(collection);

// Numeric assertions
Assert.InRange(actual, low, high);
Assert.NotInRange(actual, low, high);

// Collection assertions
Assert.Collection(collection,
    item => Assert.Equal(1, item),
    item => Assert.Equal(2, item));
Assert.Contains(expectedItem, collection);
Assert.DoesNotContain(item, collection);
Assert.All(collection, item => Assert.True(item > 0));

// Type assertions
Assert.IsType<ExpectedType>(obj);
Assert.IsNotType<UnexpectedType>(obj);
Assert.IsAssignableFrom<BaseType>(obj);

// Exception assertions
Assert.Throws<ArgumentException>(() => method());
var exception = Assert.Throws<InvalidOperationException>(() => method());
Assert.Equal("Expected message", exception.Message);

// Floating point assertions
Assert.Equal(expected, actual, precision: 2);
```

### NUnit Assertions

```csharp
// Equality
Assert.That(actual, Is.EqualTo(expected));
Assert.That(actual, Is.Not.EqualTo(expected));

// Boolean
Assert.That(condition, Is.True);
Assert.That(condition, Is.False);

// Null checks
Assert.That(obj, Is.Null);
Assert.That(obj, Is.Not.Null);

// String assertions
Assert.That(actualString, Does.Contain("substring"));
Assert.That(actualString, Does.StartWith("prefix"));
Assert.That(actualString, Does.EndWith("suffix"));
Assert.That(actualString, Is.Empty);
Assert.That(actualString, Is.Not.Empty);

// Numeric assertions
Assert.That(actual, Is.InRange(low, high));
Assert.That(actual, Is.GreaterThan(value));
Assert.That(actual, Is.LessThan(value));
Assert.That(actual, Is.Positive);
Assert.That(actual, Is.Negative);

// Collection assertions
Assert.That(collection, Has.Count.EqualTo(3));
Assert.That(collection, Contains.Item(expectedItem));
Assert.That(collection, Is.Empty);
Assert.That(collection, Is.Ordered);
Assert.That(collection, Is.Unique);

// Type assertions
Assert.That(obj, Is.TypeOf<ExpectedType>());
Assert.That(obj, Is.InstanceOf<BaseType>());

// Exception assertions
Assert.Throws<ArgumentException>(() => method());
var exception = Assert.Throws<InvalidOperationException>(() => method());
Assert.That(exception.Message, Is.EqualTo("Expected message"));

// Floating point
Assert.That(actual, Is.EqualTo(expected).Within(0.01));
```

### FluentAssertions (Popular Library)

```csharp
// Install: dotnet add package FluentAssertions

using FluentAssertions;

// Equality
actual.Should().Be(expected);
actual.Should().NotBe(unexpected);

// Boolean
condition.Should().BeTrue();
condition.Should().BeFalse();

// Null checks
obj.Should().BeNull();
obj.Should().NotBeNull();

// String assertions
actualString.Should().Contain("substring");
actualString.Should().StartWith("prefix");
actualString.Should().EndWith("suffix");
actualString.Should().BeEmpty();
actualString.Should().NotBeNullOrWhiteSpace();
actualString.Should().Match("pattern*");

// Numeric assertions
number.Should().BePositive();
number.Should().BeNegative();
number.Should().BeInRange(1, 10);
number.Should().BeGreaterThan(5);
number.Should().BeLessThanOrEqualTo(10);
number.Should().BeApproximately(3.14, 0.01);

// Collection assertions
collection.Should().HaveCount(5);
collection.Should().Contain(item);
collection.Should().NotContain(item);
collection.Should().ContainSingle();
collection.Should().BeEmpty();
collection.Should().BeInAscendingOrder();
collection.Should().OnlyContain(x => x > 0);
collection.Should().BeEquivalentTo(expectedCollection);

// Exception assertions
Action act = () => method();
act.Should().Throw<ArgumentException>()
    .WithMessage("Expected message");
act.Should().NotThrow();

// Object assertions
obj.Should().BeOfType<ExpectedType>();
obj.Should().BeAssignableTo<BaseType>();
obj.Should().NotBeSameAs(otherObj);

// DateTime assertions
date.Should().Be(expectedDate);
date.Should().BeAfter(otherDate);
date.Should().BeBefore(otherDate);
date.Should().BeCloseTo(expectedDate, TimeSpan.FromSeconds(1));
```

## Practical Examples

### Testing Simple Methods

```csharp
// Class to test
public class Calculator
{
    public int Add(int a, int b)
    {
        return a + b;
    }
    
    public int Subtract(int a, int b)
    {
        return a - b;
    }
    
    public decimal Divide(decimal a, decimal b)
    {
        if (b == 0)
            throw new DivideByZeroException("Cannot divide by zero");
        
        return a / b;
    }
    
    public bool IsEven(int number)
    {
        return number % 2 == 0;
    }
}

// xUnit Tests
public class CalculatorTests
{
    private readonly Calculator _calculator;
    
    public CalculatorTests()
    {
        _calculator = new Calculator();
    }
    
    [Fact]
    public void Add_TwoPositiveNumbers_ReturnsCorrectSum()
    {
        // Arrange
        int a = 5;
        int b = 3;
        
        // Act
        int result = _calculator.Add(a, b);
        
        // Assert
        Assert.Equal(8, result);
    }
    
    [Theory]
    [InlineData(5, 3, 8)]
    [InlineData(0, 0, 0)]
    [InlineData(-1, -1, -2)]
    [InlineData(-5, 3, -2)]
    public void Add_VariousInputs_ReturnsCorrectSum(int a, int b, int expected)
    {
        // Act
        int result = _calculator.Add(a, b);
        
        // Assert
        Assert.Equal(expected, result);
    }
    
    [Fact]
    public void Divide_ByZero_ThrowsDivideByZeroException()
    {
        // Arrange
        decimal a = 10;
        decimal b = 0;
        
        // Act & Assert
        var exception = Assert.Throws<DivideByZeroException>(
            () => _calculator.Divide(a, b));
        
        Assert.Equal("Cannot divide by zero", exception.Message);
    }
    
    [Theory]
    [InlineData(2, true)]
    [InlineData(3, false)]
    [InlineData(0, true)]
    [InlineData(-4, true)]
    public void IsEven_VariousNumbers_ReturnsCorrectResult(int number, bool expected)
    {
        // Act
        bool result = _calculator.IsEven(number);
        
        // Assert
        Assert.Equal(expected, result);
    }
}
```

### Testing Classes with Dependencies

```csharp
// Interface
public interface IEmailService
{
    void SendEmail(string to, string subject, string body);
    bool IsEmailValid(string email);
}

// Service to test
public class UserService
{
    private readonly IEmailService _emailService;
    private readonly List<User> _users;
    
    public UserService(IEmailService emailService)
    {
        _emailService = emailService;
        _users = new List<User>();
    }
    
    public bool RegisterUser(string username, string email)
    {
        if (string.IsNullOrWhiteSpace(username))
            return false;
        
        if (!_emailService.IsEmailValid(email))
            return false;
        
        var user = new User { Username = username, Email = email };
        _users.Add(user);
        
        _emailService.SendEmail(email, "Welcome", $"Welcome {username}!");
        
        return true;
    }
    
    public User GetUser(string username)
    {
        return _users.FirstOrDefault(u => u.Username == username);
    }
}

// Tests using Moq
// Install: dotnet add package Moq

using Moq;

public class UserServiceTests
{
    private readonly Mock<IEmailService> _emailServiceMock;
    private readonly UserService _userService;
    
    public UserServiceTests()
    {
        _emailServiceMock = new Mock<IEmailService>();
        _userService = new UserService(_emailServiceMock.Object);
    }
    
    [Fact]
    public void RegisterUser_ValidData_ReturnsTrue()
    {
        // Arrange
        string username = "john";
        string email = "john@example.com";
        
        _emailServiceMock
            .Setup(x => x.IsEmailValid(email))
            .Returns(true);
        
        // Act
        bool result = _userService.RegisterUser(username, email);
        
        // Assert
        Assert.True(result);
    }
    
    [Fact]
    public void RegisterUser_ValidData_SendsWelcomeEmail()
    {
        // Arrange
        string username = "john";
        string email = "john@example.com";
        
        _emailServiceMock
            .Setup(x => x.IsEmailValid(email))
            .Returns(true);
        
        // Act
        _userService.RegisterUser(username, email);
        
        // Assert
        _emailServiceMock.Verify(
            x => x.SendEmail(
                email, 
                "Welcome", 
                $"Welcome {username}!"),
            Times.Once);
    }
    
    [Fact]
    public void RegisterUser_InvalidEmail_ReturnsFalse()
    {
        // Arrange
        string username = "john";
        string email = "invalid-email";
        
        _emailServiceMock
            .Setup(x => x.IsEmailValid(email))
            .Returns(false);
        
        // Act
        bool result = _userService.RegisterUser(username, email);
        
        // Assert
        Assert.False(result);
        _emailServiceMock.Verify(
            x => x.SendEmail(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()),
            Times.Never);
    }
    
    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void RegisterUser_InvalidUsername_ReturnsFalse(string username)
    {
        // Act
        bool result = _userService.RegisterUser(username, "john@example.com");
        
        // Assert
        Assert.False(result);
    }
    
    [Fact]
    public void GetUser_ExistingUser_ReturnsUser()
    {
        // Arrange
        string username = "john";
        string email = "john@example.com";
        
        _emailServiceMock.Setup(x => x.IsEmailValid(email)).Returns(true);
        _userService.RegisterUser(username, email);
        
        // Act
        var user = _userService.GetUser(username);
        
        // Assert
        Assert.NotNull(user);
        Assert.Equal(username, user.Username);
        Assert.Equal(email, user.Email);
    }
    
    [Fact]
    public void GetUser_NonExistingUser_ReturnsNull()
    {
        // Act
        var user = _userService.GetUser("nonexistent");
        
        // Assert
        Assert.Null(user);
    }
}
```

### Testing Async Methods

```csharp
// Service with async methods
public class DataService
{
    private readonly HttpClient _httpClient;
    
    public DataService(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }
    
    public async Task<User> GetUserAsync(int id)
    {
        var response = await _httpClient.GetAsync($"/api/users/{id}");
        response.EnsureSuccessStatusCode();
        
        var json = await response.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<User>(json);
    }
    
    public async Task<bool> SaveUserAsync(User user)
    {
        var json = JsonSerializer.Serialize(user);
        var content = new StringContent(json, Encoding.UTF8, "application/json");
        
        var response = await _httpClient.PostAsync("/api/users", content);
        return response.IsSuccessStatusCode;
    }
}

// Tests
public class DataServiceTests
{
    [Fact]
    public async Task GetUserAsync_ValidId_ReturnsUser()
    {
        // Arrange
        var mockHandler = new Mock<HttpMessageHandler>();
        var user = new User { Id = 1, Username = "john" };
        var json = JsonSerializer.Serialize(user);
        
        mockHandler
            .Protected()
            .Setup<Task<HttpResponseMessage>>(
                "SendAsync",
                ItExpr.IsAny<HttpRequestMessage>(),
                ItExpr.IsAny<CancellationToken>())
            .ReturnsAsync(new HttpResponseMessage
            {
                StatusCode = HttpStatusCode.OK,
                Content = new StringContent(json)
            });
        
        var httpClient = new HttpClient(mockHandler.Object)
        {
            BaseAddress = new Uri("http://test.com")
        };
        
        var service = new DataService(httpClient);
        
        // Act
        var result = await service.GetUserAsync(1);
        
        // Assert
        Assert.NotNull(result);
        Assert.Equal(1, result.Id);
        Assert.Equal("john", result.Username);
    }
    
    [Fact]
    public async Task GetUserAsync_UserNotFound_ThrowsException()
    {
        // Arrange
        var mockHandler = new Mock<HttpMessageHandler>();
        
        mockHandler
            .Protected()
            .Setup<Task<HttpResponseMessage>>(
                "SendAsync",
                ItExpr.IsAny<HttpRequestMessage>(),
                ItExpr.IsAny<CancellationToken>())
            .ReturnsAsync(new HttpResponseMessage
            {
                StatusCode = HttpStatusCode.NotFound
            });
        
        var httpClient = new HttpClient(mockHandler.Object)
        {
            BaseAddress = new Uri("http://test.com")
        };
        
        var service = new DataService(httpClient);
        
        // Act & Assert
        await Assert.ThrowsAsync<HttpRequestException>(
            async () => await service.GetUserAsync(999));
    }
}
```

### Testing Collections

```csharp
public class ShoppingCart
{
    private readonly List<CartItem> _items = new();
    
    public IReadOnlyList<CartItem> Items => _items.AsReadOnly();
    
    public void AddItem(string productName, decimal price, int quantity = 1)
    {
        if (quantity <= 0)
            throw new ArgumentException("Quantity must be positive", nameof(quantity));
        
        var existingItem = _items.FirstOrDefault(i => i.ProductName == productName);
        
        if (existingItem != null)
        {
            existingItem.Quantity += quantity;
        }
        else
        {
            _items.Add(new CartItem
            {
                ProductName = productName,
                Price = price,
                Quantity = quantity
            });
        }
    }
    
    public void RemoveItem(string productName)
    {
        var item = _items.FirstOrDefault(i => i.ProductName == productName);
        if (item != null)
        {
            _items.Remove(item);
        }
    }
    
    public decimal GetTotal()
    {
        return _items.Sum(i => i.Price * i.Quantity);
    }
    
    public void Clear()
    {
        _items.Clear();
    }
}

// Tests with FluentAssertions
public class ShoppingCartTests
{
    private readonly ShoppingCart _cart;
    
    public ShoppingCartTests()
    {
        _cart = new ShoppingCart();
    }
    
    [Fact]
    public void NewCart_ShouldBeEmpty()
    {
        // Assert
        _cart.Items.Should().BeEmpty();
        _cart.GetTotal().Should().Be(0);
    }
    
    [Fact]
    public void AddItem_NewProduct_ShouldAddToCart()
    {
        // Act
        _cart.AddItem("Book", 29.99m, 2);
        
        // Assert
        _cart.Items.Should().HaveCount(1);
        _cart.Items.Should().ContainSingle(i => 
            i.ProductName == "Book" && 
            i.Price == 29.99m && 
            i.Quantity == 2);
    }
    
    [Fact]
    public void AddItem_ExistingProduct_ShouldIncreaseQuantity()
    {
        // Arrange
        _cart.AddItem("Book", 29.99m, 2);
        
        // Act
        _cart.AddItem("Book", 29.99m, 3);
        
        // Assert
        _cart.Items.Should().HaveCount(1);
        var item = _cart.Items.First();
        item.Quantity.Should().Be(5);
    }
    
    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public void AddItem_InvalidQuantity_ShouldThrowException(int quantity)
    {
        // Act
        Action act = () => _cart.AddItem("Book", 29.99m, quantity);
        
        // Assert
        act.Should().Throw<ArgumentException>()
            .WithParameterName("quantity")
            .WithMessage("Quantity must be positive*");
    }
    
    [Fact]
    public void GetTotal_MultipleItems_ShouldCalculateCorrectly()
    {
        // Arrange
        _cart.AddItem("Book", 29.99m, 2);
        _cart.AddItem("Pen", 1.99m, 5);
        
        // Act
        decimal total = _cart.GetTotal();
        
        // Assert
        total.Should().Be(69.93m);
    }
    
    [Fact]
    public void RemoveItem_ExistingProduct_ShouldRemoveFromCart()
    {
        // Arrange
        _cart.AddItem("Book", 29.99m);
        _cart.AddItem("Pen", 1.99m);
        
        // Act
        _cart.RemoveItem("Book");
        
        // Assert
        _cart.Items.Should().HaveCount(1);
        _cart.Items.Should().NotContain(i => i.ProductName == "Book");
    }
    
    [Fact]
    public void Clear_ShouldRemoveAllItems()
    {
        // Arrange
        _cart.AddItem("Book", 29.99m);
        _cart.AddItem("Pen", 1.99m);
        
        // Act
        _cart.Clear();
        
        // Assert
        _cart.Items.Should().BeEmpty();
        _cart.GetTotal().Should().Be(0);
    }
}
```

## Mocking with Moq

### Basic Moq Usage

```csharp
// Install: dotnet add package Moq

using Moq;

// Creating a mock
var mockRepository = new Mock<IUserRepository>();

// Setup return values
mockRepository
    .Setup(x => x.GetById(1))
    .Returns(new User { Id = 1, Name = "John" });

// Setup with parameters
mockRepository
    .Setup(x => x.GetById(It.IsAny<int>()))
    .Returns((int id) => new User { Id = id, Name = $"User{id}" });

// Setup async methods
mockRepository
    .Setup(x => x.GetByIdAsync(1))
    .ReturnsAsync(new User { Id = 1, Name = "John" });

// Setup void methods
mockRepository
    .Setup(x => x.Delete(It.IsAny<int>()));

// Setup exceptions
mockRepository
    .Setup(x => x.GetById(-1))
    .Throws<ArgumentException>();

// Verify method was called
mockRepository.Verify(x => x.GetById(1), Times.Once);
mockRepository.Verify(x => x.GetById(It.IsAny<int>()), Times.AtLeastOnce);
mockRepository.Verify(x => x.Delete(It.IsAny<int>()), Times.Never);

// Verify with specific parameters
mockRepository.Verify(
    x => x.Update(It.Is<User>(u => u.Id == 1 && u.Name == "John")),
    Times.Once);
```

### Advanced Moq Scenarios

```csharp
public class AdvancedMoqTests
{
    [Fact]
    public void Test_CallbackOnMethodCall()
    {
        // Arrange
        var mock = new Mock<IEmailService>();
        string sentTo = null;
        
        mock.Setup(x => x.SendEmail(It.IsAny<string>(), It.IsAny<string>()))
            .Callback<string, string>((to, subject) => sentTo = to);
        
        // Act
        mock.Object.SendEmail("test@example.com", "Hello");
        
        // Assert
        Assert.Equal("test@example.com", sentTo);
    }
    
    [Fact]
    public void Test_SetupSequence()
    {
        // Arrange
        var mock = new Mock<IDataService>();
        
        mock.SetupSequence(x => x.GetValue())
            .Returns(1)
            .Returns(2)
            .Returns(3);
        
        // Act & Assert
        Assert.Equal(1, mock.Object.GetValue());
        Assert.Equal(2, mock.Object.GetValue());
        Assert.Equal(3, mock.Object.GetValue());
    }
    
    [Fact]
    public void Test_PropertyMocking()
    {
        // Arrange
        var mock = new Mock<IConfiguration>();
        
        mock.Setup(x => x.ConnectionString).Returns("Server=localhost");
        mock.SetupProperty(x => x.Timeout, 30);
        
        // Act & Assert
        Assert.Equal("Server=localhost", mock.Object.ConnectionString);
        Assert.Equal(30, mock.Object.Timeout);
        
        mock.Object.Timeout = 60;
        Assert.Equal(60, mock.Object.Timeout);
    }
    
    [Fact]
    public void Test_OutParameter()
    {
        // Arrange
        var mock = new Mock<IParser>();
        int value = 42;
        
        mock.Setup(x => x.TryParse("42", out value))
            .Returns(true);
        
        // Act
        int result;
        bool success = mock.Object.TryParse("42", out result);
        
        // Assert
        Assert.True(success);
        Assert.Equal(42, result);
    }
}
```

## Test Organization

### Setup and Cleanup

```csharp
// xUnit - Constructor and IDisposable
public class DatabaseTests : IDisposable
{
    private readonly DatabaseConnection _connection;
    
    // Constructor runs before each test
    public DatabaseTests()
    {
        _connection = new DatabaseConnection();
        _connection.Open();
    }
    
    [Fact]
    public void Test1()
    {
        // Test code
    }
    
    // Dispose runs after each test
    public void Dispose()
    {
        _connection?.Close();
        _connection?.Dispose();
    }
}

// xUnit - Class Fixtures (shared across tests in class)
public class DatabaseFixture : IDisposable
{
    public DatabaseConnection Connection { get; }
    
    public DatabaseFixture()
    {
        Connection = new DatabaseConnection();
        Connection.Open();
    }
    
    public void Dispose()
    {
        Connection?.Close();
        Connection?.Dispose();
    }
}

public class DatabaseTests : IClassFixture<DatabaseFixture>
{
    private readonly DatabaseConnection _connection;
    
    public DatabaseTests(DatabaseFixture fixture)
    {
        _connection = fixture.Connection;
    }
    
    [Fact]
    public void Test1()
    {
        // Use _connection
    }
}

// NUnit - Setup and TearDown
[TestFixture]
public class DatabaseTests
{
    private DatabaseConnection _connection;
    
    [SetUp]
    public void Setup()
    {
        _connection = new DatabaseConnection();
        _connection.Open();
    }
    
    [TearDown]
    public void TearDown()
    {
        _connection?.Close();
        _connection?.Dispose();
    }
    
    [Test]
    public void Test1()
    {
        // Test code
    }
}

// MSTest - Initialize and Cleanup
[TestClass]
public class DatabaseTests
{
    private DatabaseConnection _connection;
    
    [TestInitialize]
    public void Initialize()
    {
        _connection = new DatabaseConnection();
        _connection.Open();
    }
    
    [TestCleanup]
    public void Cleanup()
    {
        _connection?.Close();
        _connection?.Dispose();
    }
    
    [TestMethod]
    public void Test1()
    {
        // Test code
    }
}
```

### Test Categories and Traits

```csharp
// xUnit - Traits
public class UserServiceTests
{
    [Fact]
    [Trait("Category", "Unit")]
    [Trait("Priority", "High")]
    public void Test_FastRunning()
    {
        // Test code
    }
    
    [Fact]
    [Trait("Category", "Integration")]
    public void Test_DatabaseDependent()
    {
        // Test code
    }
}

// Run specific traits
// dotnet test --filter "Category=Unit"
// dotnet test --filter "Priority=High"

// NUnit - Category
[TestFixture]
public class UserServiceTests
{
    [Test]
    [Category("Unit")]
    [Category("Fast")]
    public void Test_FastRunning()
    {
        // Test code
    }
    
    [Test]
    [Category("Integration")]
    public void Test_DatabaseDependent()
    {
        // Test code
    }
}

// MSTest - TestCategory
[TestClass]
public class UserServiceTests
{
    [TestMethod]
    [TestCategory("Unit")]
    [TestCategory("Fast")]
    public void Test_FastRunning()
    {
        // Test code
    }
    
    [TestMethod]
    [TestCategory("Integration")]
    public void Test_DatabaseDependent()
    {
        // Test code
    }
}
```

## Test-Driven Development (TDD) in C#

### TDD Workflow Example

```csharp
// Step 1: Write a failing test
[Fact]
public void GetDiscount_OrderOver100_Returns10PercentDiscount()
{
    // Arrange
    var calculator = new PriceCalculator();
    decimal orderAmount = 150m;
    
    // Act
    decimal discount = calculator.GetDiscount(orderAmount);
    
    // Assert
    Assert.Equal(15m, discount);
}

// Step 2: Run test - it fails (PriceCalculator doesn't exist)

// Step 3: Write minimal code to pass
public class PriceCalculator
{
    public decimal GetDiscount(decimal orderAmount)
    {
        if (orderAmount > 100)
            return orderAmount * 0.1m;
        
        return 0;
    }
}

// Step 4: Run test - it passes

// Step 5: Refactor
public class PriceCalculator
{
    private const decimal DISCOUNT_THRESHOLD = 100m;
    private const decimal DISCOUNT_RATE = 0.1m;
    
    public decimal GetDiscount(decimal orderAmount)
    {
        if (orderAmount > DISCOUNT_THRESHOLD)
            return orderAmount * DISCOUNT_RATE;
        
        return 0;
    }
}

// Step 6: Add more tests
[Theory]
[InlineData(50, 0)]
[InlineData(100, 0)]
[InlineData(100.01, 10.001)]
[InlineData(200, 20)]
public void GetDiscount_VariousAmounts_ReturnsCorrectDiscount(
    decimal orderAmount, 
    decimal expectedDiscount)
{
    // Arrange
    var calculator = new PriceCalculator();
    
    // Act
    decimal discount = calculator.GetDiscount(orderAmount);
    
    // Assert
    Assert.Equal(expectedDiscount, discount, 2);
}
```

## Code Coverage

### Using Coverlet

```bash
# Install Coverlet
dotnet add package coverlet.collector

# Run tests with coverage
dotnet test /p:CollectCoverage=true

# Generate coverage report
dotnet test /p:CollectCoverage=true /p:CoverletOutputFormat=opencover

# With threshold
dotnet test /p:CollectCoverage=true /p:Threshold=80
```

### Using ReportGenerator

```bash
# Install ReportGenerator
dotnet tool install -g dotnet-reportgenerator-globaltool

# Generate HTML report
dotnet test /p:CollectCoverage=true /p:CoverletOutputFormat=cobertura
reportgenerator -reports:coverage.cobertura.xml -targetdir:coveragereport

# View report
# Open coveragereport/index.html in browser
```

### Coverage in Visual Studio

1. Test → Analyze Code Coverage for All Tests
2. View coverage results in Code Coverage Results window
3. Right-click on assembly → Export Coverage Results

## Best Practices for C# Unit Testing

### Naming Conventions

```csharp
// Pattern: MethodName_Scenario_ExpectedBehavior

[Fact]
public void Add_TwoPositiveNumbers_ReturnsSum() { }

[Fact]
public void GetUser_InvalidId_ThrowsArgumentException() { }

[Fact]
public void ProcessOrder_InsufficientStock_ReturnsFalse() { }

// Alternative: Given_When_Then
[Fact]
public void GivenValidUser_WhenRegistering_ThenUserIsCreated() { }
```

### Use Object Mothers or Builders

```csharp
// Object Mother pattern
public static class UserMother
{
    public static User CreateValidUser()
    {
        return new User
        {
            Id = 1,
            Username = "testuser",
            Email = "test@example.com",
            IsActive = true
        };
    }
    
    public static User CreateInactiveUser()
    {
        var user = CreateValidUser();
        user.IsActive = false;
        return user;
    }
}

// Usage
[Fact]
public void ProcessUser_InactiveUser_ThrowsException()
{
    // Arrange
    var user = UserMother.CreateInactiveUser();
    var service = new UserService();
    
    // Act & Assert
    Assert.Throws<InvalidOperationException>(() => service.ProcessUser(user));
}

// Builder pattern
public class UserBuilder
{
    private int _id = 1;
    private string _username = "testuser";
    private string _email = "test@example.com";
    private bool _isActive = true;
    
    public UserBuilder WithId(int id)
    {
        _id = id;
        return this;
    }
    
    public UserBuilder WithUsername(string username)
    {
        _username = username;
        return this;
    }
    
    public UserBuilder WithEmail(string email)
    {
        _email = email;
        return this;
    }
    
    public UserBuilder Inactive()
    {
        _isActive = false;
        return this;
    }
    
    public User Build()
    {
        return new User
        {
            Id = _id,
            Username = _username,
            Email = _email,
            IsActive = _isActive
        };
    }
}

// Usage
[Fact]
public void Test_CustomUser()
{
    // Arrange
    var user = new UserBuilder()
        .WithId(42)
        .WithUsername("john")
        .Inactive()
        .Build();
    
    // Act & Assert
    Assert.Equal(42, user.Id);
    Assert.False(user.IsActive);
}
```

### AutoFixture for Test Data

```csharp
// Install: dotnet add package AutoFixture
// Install: dotnet add package AutoFixture.Xunit2

using AutoFixture;
using AutoFixture.Xunit2;

public class AutoFixtureTests
{
    [Fact]
    public void Test_WithAutoFixture()
    {
        // Arrange
        var fixture = new Fixture();
        var user = fixture.Create<User>();
        
        // user is created with random but valid data
        Assert.NotNull(user.Username);
        Assert.NotNull(user.Email);
    }
    
    // AutoData attribute
    [Theory]
    [AutoData]
    public void Test_WithAutoData(User user, string message)
    {
        // user and message are auto-generated
        Assert.NotNull(user);
        Assert.NotNull(message);
    }
    
    // InlineAutoData
    [Theory]
    [InlineAutoData(1)]
    [InlineAutoData(2)]
    public void Test_WithInlineAutoData(int id, User user)
    {
        // id is provided, user is auto-generated
        Assert.True(id > 0);
        Assert.NotNull(user);
    }
}
```

### Testing Private Methods

```csharp
// Option 1: Don't test private methods directly
// Test them through public methods

// Option 2: Make them internal and use InternalsVisibleTo
// In the main project's .csproj or AssemblyInfo.cs:
// [assembly: InternalsVisibleTo("MyApp.Tests")]

// Option 3: Use reflection (not recommended)
public class ReflectionTests
{
    [Fact]
    public void Test_PrivateMethod()
    {
        // Arrange
        var calculator = new Calculator();
        var methodInfo = typeof(Calculator).GetMethod(
            "PrivateMethod",
            BindingFlags.NonPublic | BindingFlags.Instance);
        
        // Act
        var result = methodInfo.Invoke(calculator, new object[] { 5, 3 });
        
        // Assert
        Assert.Equal(8, result);
    }
}

// Best practice: Reconsider if private method needs testing
// It might indicate the method should be:
// 1. Public (if it's important enough to test)
// 2. In a separate class (Single Responsibility Principle)
// 3. Tested through public methods that use it
```

## Common Testing Scenarios

### Testing Entity Framework

```csharp
// Using EF Core In-Memory Database
// Install: Microsoft.EntityFrameworkCore.InMemory

public class ProductRepositoryTests : IDisposable
{
    private readonly AppDbContext _context;
    private readonly ProductRepository _repository;
    
    public ProductRepositoryTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        
        _context = new AppDbContext(options);
        _repository = new ProductRepository(_context);
        
        // Seed data
        _context.Products.AddRange(
            new Product { Id = 1, Name = "Product 1", Price = 10.99m },
            new Product { Id = 2, Name = "Product 2", Price = 20.99m }
        );
        _context.SaveChanges();
    }
    
    [Fact]
    public async Task GetById_ExistingProduct_ReturnsProduct()
    {
        // Act
        var product = await _repository.GetByIdAsync(1);
        
        // Assert
        Assert.NotNull(product);
        Assert.Equal("Product 1", product.Name);
    }
    
    [Fact]
    public async Task Add_NewProduct_IncreasesCount()
    {
        // Arrange
        var newProduct = new Product { Id = 3, Name = "Product 3", Price = 30.99m };
        
        // Act
        await _repository.AddAsync(newProduct);
        var count = await _context.Products.CountAsync();
        
        // Assert
        Assert.Equal(3, count);
    }
    
    public void Dispose()
    {
        _context.Database.EnsureDeleted();
        _context.Dispose();
    }
}
```

### Testing Controllers (ASP.NET Core)

```csharp
public class ProductsController : ControllerBase
{
    private readonly IProductService _productService;
    
    public ProductsController(IProductService productService)
    {
        _productService = productService;
    }
    
    [HttpGet("{id}")]
    public async Task<IActionResult> GetProduct(int id)
    {
        var product = await _productService.GetByIdAsync(id);
        
        if (product == null)
            return NotFound();
        
        return Ok(product);
    }
    
    [HttpPost]
    public async Task<IActionResult> CreateProduct([FromBody] ProductDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);
        
        var product = await _productService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, product);
    }
}

// Tests
public class ProductsControllerTests
{
    private readonly Mock<IProductService> _productServiceMock;
    private readonly ProductsController _controller;
    
    public ProductsControllerTests()
    {
        _productServiceMock = new Mock<IProductService>();
        _controller = new ProductsController(_productServiceMock.Object);
    }
    
    [Fact]
    public async Task GetProduct_ExistingId_ReturnsOkWithProduct()
    {
        // Arrange
        var product = new Product { Id = 1, Name = "Test Product" };
        _productServiceMock
            .Setup(x => x.GetByIdAsync(1))
            .ReturnsAsync(product);
        
        // Act
        var result = await _controller.GetProduct(1);
        
        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var returnedProduct = Assert.IsType<Product>(okResult.Value);
        Assert.Equal(1, returnedProduct.Id);
    }
    
    [Fact]
    public async Task GetProduct_NonExistingId_ReturnsNotFound()
    {
        // Arrange
        _productServiceMock
            .Setup(x => x.GetByIdAsync(999))
            .ReturnsAsync((Product)null);
        
        // Act
        var result = await _controller.GetProduct(999);
        
        // Assert
        Assert.IsType<NotFoundResult>(result);
    }
    
    [Fact]
    public async Task CreateProduct_ValidData_ReturnsCreatedAtAction()
    {
        // Arrange
        var dto = new ProductDto { Name = "New Product", Price = 29.99m };
        var product = new Product { Id = 1, Name = dto.Name, Price = dto.Price };
        
        _productServiceMock
            .Setup(x => x.CreateAsync(dto))
            .ReturnsAsync(product);
        
        // Act
        var result = await _controller.CreateProduct(dto);
        
        // Assert
        var createdResult = Assert.IsType<CreatedAtActionResult>(result);
        Assert.Equal(nameof(ProductsController.GetProduct), createdResult.ActionName);
        var returnedProduct = Assert.IsType<Product>(createdResult.Value);
        Assert.Equal(1, returnedProduct.Id);
    }
    
    [Fact]
    public async Task CreateProduct_InvalidModelState_ReturnsBadRequest()
    {
        // Arrange
        _controller.ModelState.AddModelError("Name", "Required");
        var dto = new ProductDto();
        
        // Act
        var result = await _controller.CreateProduct(dto);
        
        // Assert
        Assert.IsType<BadRequestObjectResult>(result);
    }
}
```

### Testing with Time Dependencies

```csharp
// Interface for time abstraction
public interface IDateTimeProvider
{
    DateTime Now { get; }
    DateTime UtcNow { get; }
}

// Implementation
public class DateTimeProvider : IDateTimeProvider
{
    public DateTime Now => DateTime.Now;
    public DateTime UtcNow => DateTime.UtcNow;
}

// Service using time
public class SubscriptionService
{
    private readonly IDateTimeProvider _dateTimeProvider;
    
    public SubscriptionService(IDateTimeProvider dateTimeProvider)
    {
        _dateTimeProvider = dateTimeProvider;
    }
    
    public bool IsSubscriptionActive(Subscription subscription)
    {
        return subscription.ExpiryDate >= _dateTimeProvider.UtcNow;
    }
}

// Tests
public class SubscriptionServiceTests
{
    [Fact]
    public void IsSubscriptionActive_NotExpired_ReturnsTrue()
    {
        // Arrange
        var mockDateTime = new Mock<IDateTimeProvider>();
        var currentDate = new DateTime(2024, 1, 1);
        mockDateTime.Setup(x => x.UtcNow).Returns(currentDate);
        
        var service = new SubscriptionService(mockDateTime.Object);
        var subscription = new Subscription
        {
            ExpiryDate = new DateTime(2024, 12, 31)
        };
        
        // Act
        var result = service.IsSubscriptionActive(subscription);
        
        // Assert
        Assert.True(result);
    }
    
    [Fact]
    public void IsSubscriptionActive_Expired_ReturnsFalse()
    {
        // Arrange
        var mockDateTime = new Mock<IDateTimeProvider>();
        var currentDate = new DateTime(2024, 6, 1);
        mockDateTime.Setup(x => x.UtcNow).Returns(currentDate);
        
        var service = new SubscriptionService(mockDateTime.Object);
        var subscription = new Subscription
        {
            ExpiryDate = new DateTime(2024, 5, 31)
        };
        
        // Act
        var result = service.IsSubscriptionActive(subscription);
        
        // Assert
        Assert.False(result);
    }
}
```

## Running Tests

### Command Line

```bash
# Run all tests
dotnet test

# Run tests in specific project
dotnet test MyApp.Tests/MyApp.Tests.csproj

# Run tests with specific filter
dotnet test --filter "FullyQualifiedName~Calculator"
dotnet test --filter "Category=Unit"

# Run with detailed output
dotnet test --verbosity detailed

# Run with coverage
dotnet test /p:CollectCoverage=true

# Run specific test
dotnet test --filter "FullyQualifiedName=MyApp.Tests.CalculatorTests.Add_TwoNumbers_ReturnsSum"
```

### Visual Studio

1. Test → Run All Tests (Ctrl+R, A)
2. Test → Debug All Tests (Ctrl+R, Ctrl+A)
3. Right-click on test → Run Test(s)
4. Test Explorer window for detailed view

### Visual Studio Code

1. Install C# extension
2. Install .NET Core Test Explorer extension
3. Tests appear in Test Explorer sidebar
4. Click play button to run tests

## Conclusion

Unit testing in C# is essential for:

- Ensuring code quality and correctness
- Facilitating refactoring with confidence
- Documenting expected behavior
- Catching bugs early in development
- Supporting continuous integration/deployment

Key takeaways:
- Use AAA pattern for clear test structure
- Choose the right testing framework for your needs
- Mock dependencies to isolate units under test
- Aim for meaningful coverage, not just high percentages
- Follow naming conventions for clarity
- Keep tests simple, fast, and independent
- Practice TDD when appropriate
- Integrate testing into your CI/CD pipeline

Remember: Good tests are as important as good production code!