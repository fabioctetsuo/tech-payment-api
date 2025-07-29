Feature: Payment Processing
  As a payment system
  I want to process payments for orders
  So that customers can pay for their purchases

  Scenario: Creating a new payment
    Given a valid payment request with order id "123", customer id "456", and amount 100.50
    When I create a payment
    Then the payment should be created with status "PENDING"
    And the payment should be processed through the payment provider
    And the payment status should be updated based on provider response

  Scenario: Updating payment status
    Given an existing payment with id "payment-123"
    When I update the payment status to "APPROVED"
    Then the payment status should be "APPROVED"
    And the updated timestamp should be current

  Scenario: Finding payment by order id
    Given a payment exists for order id "order-456"
    When I search for payment by order id "order-456"
    Then I should receive the payment details