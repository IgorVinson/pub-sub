class User {
  constructor(name) {
    this.name = name;
  }
}

class Bank {
  accounts = {};
  clients = [];

  constructor(name) {
    this.name = name;
  }

  openAccount(user) {
    const account = new BankAccount(this);

    this.accounts[account.id] = account;

    if (!user) {
      account.registerOwner(this);
    } else {
      account.registerOwner(user);

      if (!this.clients.includes(user)) {
        this.clients.push(user);
      }
    }

    return account;
  }
}

class BankAccount {
  id = generateId();
  amount = 0;
  transactionHistory = [];
  owner = null;

  constructor(bank) {
    this.bank = bank;
  }

  registerOwner(user) {
    this.owner = user;
  }

  transfer(id, amount) {
    if (!(amount > 0)) {
      throw new Error('Amount must be positive');
    }

    if (id === this.id) {
      throw new Error('Can`t transfer to the same account');
    }

    const targetAccount = this.bank.accounts[id];

    if (!targetAccount) {
      throw new Error('Target account not found');
    }

    targetAccount.receive(this.id, amount);

    this.amount -= amount;

    this.transactionHistory.push({
      date: new Date(),
      from: this.id,
      to: id,
      amount: -amount,
    });
  }

  receive(id, amount) {
    if (!(amount > 0)) {
      throw new Error('Amount must be positive');
    }

    this.amount += amount;
    this.transactionHistory.push({
      date: new Date(),
      from: id,
      to: this.id,
      amount,
    });
  }

  put(amount) {
    if (!(amount > 0)) {
      throw new Error('Amount must be positive');
    }
    this.amount = amount;
  }
}

const user1 = new User('Ivan');
const user2 = new User('Serhiy');

const bank1 = new Bank('Public42');

const bankAccount = bank1.openAccount();
bankAccount.put(1_500_000);

const bankAccount1 = bank1.openAccount(user1);
const bankAccount2 = bank1.openAccount(user2);

bankAccount1.on('income', transaction => {
  user1.notify(transaction.info);
});

function generateId() {
  return Math.random().toFixed(10).slice(2);
}
