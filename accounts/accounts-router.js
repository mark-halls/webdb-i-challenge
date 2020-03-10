const express = require(`express`);

const knex = require(`../data/dbConfig`);

const router = express.Router();

router.use(express.json());

function validateId(req, res, next) {
  const id = req.params.id;
  knex(`accounts`)
    .select(`*`)
    .where({ id })
    .first()
    .then(account => {
      if (account) {
        req.account = account;
        next();
      } else {
        res.status(404).json({ message: `account ${id} not found` });
      }
    })
    .catch(error => {
      console.error(error);
      res
        .status(500)
        .json({ errorMessage: `could not retrieve account from database` });
    });
}

// get accounts
router.get(`/`, (req, res) => {
  knex
    .select(`*`)
    .from(`accounts`)
    .then(accounts => res.status(200).json(accounts))
    .catch(error => {
      console.error(error);
      res
        .status(500)
        .json({ errorMessage: `could not retrieve accounts from database` });
    });
});

// get account by id
router.get(`/:id`, validateId, (req, res) => {
  res.status(200).json(req.account);
});

// add account
router.post(`/`, (req, res) => {
  const accountData = req.body;
  if (accountData.name && accountData.budget) {
    knex(`accounts`)
      .insert(accountData, "id")
      .then(ids => {
        const id = ids[0];
        return knex(`accounts`)
          .select(`*`)
          .where({ id })
          .first()
          .then(account => res.status(201).json(account))
          .catch(error => {
            console.log(error);
            res.status(500).json({ errorMessage: "Error returning account" });
          });
      })
      .catch(error => {
        console.error(error);
        res.status(500).json({ errorMessage: `Could not add account` });
      });
  } else {
    res
      .status(400)
      .json({ errorMessage: `Body must contain 'name' and 'budget'` });
  }
});

// update account by id
router.put(`/:id`, validateId, (req, res) => {
  const { id } = req.account;
  const data = req.body;
  if (data.name || data.budget) {
    knex(`accounts`)
      .where({ id })
      .update(data)
      .then(count => {
        res.status(200).json({ message: `${count} record(s) updated` });
      })
      .catch(error =>
        res.status(500).json({ errorMessage: `Unable to update account` })
      );
  }
});

// delete account
router.delete(`/:id`, validateId, (req, res) => {
  const { id } = req.account;
  knex(`accounts`)
    .where({ id })
    .del()
    .then(count =>
      res.status(202).json({ message: `${count} record(s) removed` })
    )
    .catch(error => {
      console.error(error);
      res.status(500).json({ errorMessage: `Error removing account` });
    });
});

module.exports = router;
