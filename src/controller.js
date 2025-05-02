const pool = require('../db');
const query = require('./queries')



const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query(query.verifyUserCredentials, [email, password]);
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    res.status(200).json({ message: 'Login successful', user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updatePassword = async (req, res) => {
  const { user_id, new_password } = req.body;
  try {
    const result = await pool.query(query.updatePassword, [new_password, user_id]);
    res.status(200).json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};




//Admin 
const isAdmin = async (user_id) => {
    try {
      const res = await pool.query(query.getUserRole, [user_id]);
      if (res.rows.length === 0) {
        return false;  // User not found
      }
      return res.rows[0].system_role === 'admin';  // Check if user is admin
    } catch (err) {
      console.error('Error fetching user data:', err);
      return false;
    }
  };


const addUser= async (req, res)=>{
    const { user, request } = req.body;

    const isUserAdmin = await isAdmin(user);

    if (!isUserAdmin) {
        return res.status(403).json({
        message: 'Permission denied: Only admin can perform this action.'
        });
    }

    pool.query(query.addUser, [request.user_name, request.password, request.email, request.address, request.system_role], (error, results) => {
        if(error) throw error;
        res.status(201).json({message: "User Added Successfuly."});
    });
}

const addStore= async (req, res)=>{
  const { user, request } = req.body;

  const isUserAdmin = await isAdmin(user);

  if (!isUserAdmin) {
      return res.status(403).json({
      message: 'Permission denied: Only admin can perform this action.'
      });
  }

  pool.query(query.addStore, [request.store_name, request.store_address, request.owner_id], (error, results) => {
      if(error) throw error;
      res.status(201).json({message: "Store Added Successfuly."});
  });
}


const getDashboardStats = async (req, res) => {
  try {
    const userCount = await pool.query(query.getTotalUser);
    const storeCount = await pool.query(query.getTotalStore);
    const ratingCount = await pool.query(query.getTotalRatings);

    res.status(200).json({
      totalUsers: userCount.rows[0].count,
      totalStores: storeCount.rows[0].count,
      totalRatings: ratingCount.rows[0].count,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to fetch dashboard statistics.");
  }
};


const getStore= async(req, res) =>{
  const {store_id, store_name, email, address, rating}=req.query;

   pool.query(query.getStores, (error, results)=>{
    if(error) throw error;
    res.status(200).json(results.rows);
   });
}

const getOwner= async(req, res) =>{
  const {owner_id, owner_name, email, address, rating}=req.query;
  
   pool.query(query.getStoreOwners, (error, results)=>{
    if(error) throw error;
    res.status(200).json(results.rows);
   });
}

const getUser= async(req, res) =>{
    const {user_id, user_name, email, address, role}=req.query;
    const all = !user_id && !user_name && !email && !address && !role;

    if (all) {
     pool.query(query.getUsers, (error, results)=>{
      if(error) throw error;
      res.status(200).json(results.rows);
     });
     return;
    }

    let baseQuery = "SELECT user_id, user_name, email, address, system_role FROM user_info";
    //let baseQuery = query.getUsers;
    let conditions = [];
    let values = [];
    
    if (user_name) {
      values.push(`%${user_name}%`);
      conditions.push(`user_name ILIKE $${values.length}`);
   }
    
    if (email) {
      values.push(`%${email}%`);
      conditions.push(`email ILIKE $${values.length}`);
    }
    
    if (address) {
      values.push(`%${address}%`);
      conditions.push(`address ILIKE $${values.length}`);
    }
    
    if (role) {
      values.push(role);
      conditions.push(`system_role = $${values.length}`);
    }
    
    if (conditions.length > 0) {
      baseQuery += " WHERE " + conditions.join(" AND ");
    }
    
    pool.query(baseQuery, values, (error, results) => {
      if (error) {
        console.error('Error executing query', error);
        res.status(500).send('Internal Server Error');
      } else {
        res.status(200).json(results.rows);
      }
    });
  }




//Store_owner
const isOwner = async (user_id) => {
  try {
    const res = await pool.query(query.getUserRole, [user_id]);
    if (res.rows.length === 0) {
      return false;  // User not found
    }
    return res.rows[0].system_role === 'store_owner';  // Check if user is admin
  } catch (err) {
    console.error('Error fetching user data:', err);
    return false;
  }
};

const getStoreRatings = async (req, res) => {
  const { user_id } = req.query;
  if (!(await isOwner(user_id))) return res.status(403).json({ message: "Access denied" });

  try {
    const result = await pool.query(query.getStoreRatings, [user_id]);
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Error fetching store ratings" });
  }
};

const getStoreAvgRating = async (req, res) => {
  const { user_id } = req.query;
  if (!(await isOwner(user_id))) return res.status(403).json({ message: "Access denied" });

  try {
    const result = await pool.query(query.getAverageRating, [user_id]);
    if (result.rows.length === 0) return res.status(404).json({ message: "Store not found" });
    res.status(200).json({ average_rating: result.rows[0].overall_rating });
  } catch (err) {
    res.status(500).json({ error: "Error fetching average rating" });
  }
};



//User
const isUser = async (user_id) => {
  try {
    const res = await pool.query(query.getUserRole, [user_id]);
    if (res.rows.length === 0) {
      return false;  // User not found
    }
    return res.rows[0].system_role === 'user';  // Check if user is admin
  } catch (err) {
    console.error('Error fetching user data:', err);
    return false;
  }
};

const signupUser = async (req, res) => {
  const { user_name, email, address, password } = req.body;
  try {
    await pool.query(query.addUser, [user_name, password, email, address, 'user']);
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
};

const getStoresForu = async (req, res) => {
  try {
    const { user_id } = req.query;
    if (!(await isUser(user_id))) return res.status(403).json({ error: "Access denied" });

    pool.query(query.getStores, (err, results) => {
      if (err) throw err;
      res.status(200).json(results.rows);
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

const searchStores = async (req, res) => {
  const { user_id, store_name, store_address } = req.query;
  if (!(await isUser(user_id))) return res.status(403).json({ error: "Unauthorized" });

  const name = `%${store_name || ''}%`;
  const address = `%${store_address || ''}%`;

  pool.query(query.searchStores, [name, address], (err, results) => {
    if (err) throw err;
    res.status(200).json(results.rows);
  });
};

const submitNewRating = async (req, res) => {
  const { user_id, store_id, rating } = req.body;
  if (!(await isUser(user_id))) return res.status(403).json({ error: "Unauthorized" });
  if (rating < 1 || rating > 5) return res.status(400).json({ error: "Rating must be 1 to 5" });

  const ratingJson = JSON.stringify([{ user_id: user_id.toString(), rating }]);

  try {
    const result = await pool.query(query.submitRating, [ratingJson, store_id, user_id.toString()]);
    if (result.rowCount === 0) {
      return res.status(409).json({ error: "Rating already exists. Use modify endpoint." });
    }
    res.status(201).json({ message: "Rating submitted successfully" });
  } catch (err) {
    console.error('Submit rating error:', err);
    res.status(500).json({ error: "Failed to submit rating" });
  }
};



module.exports={
    loginUser,
    updatePassword,

    isAdmin,
    isOwner,
    isUser,
    getDashboardStats,

    getUser,
    getStore,
    getOwner,

    addUser,
    addStore,

    getStoreRatings,
    getStoreAvgRating,

    signupUser,
    getStoresForu,
    searchStores,
    submitNewRating
    
}