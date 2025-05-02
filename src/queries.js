const verifyUserCredentials = "SELECT * FROM user_info WHERE email = $1 AND password = $2";
const updatePassword = "UPDATE user_info SET password = $1 WHERE user_id = $2";

const addUser ="INSERT INTO user_info (user_name, password, email, address, system_role) VALUES ($1, $2, $3, $4, $5);"
const addStore="INSERT INTO store_data (store_name, store_address, owner_id);"

const getTotalUser = "SELECT COUNT(*) FROM user_info;"
const getTotalStore = "SELECT COUNT(*) FROM store_data;"
const getTotalRatings = "SELECT COUNT(*) FROM store_data WHERE user_ratings IS NOT NULL;"

const getStores="SELECT store_id, store_name, store_email, store_address, overall_rating FROM store_data;"
const getUsers="SELECT user_id, user_name, email, address, system_role FROM user_info;"
const getStoreOwners="SELECT u.user_id, u.user_name, u.email, u.address, u.system_role, s.overall_rating FROM user_info u JOIN store_data s ON u.user_id=s.owner_id";

//check role
const getUserRole = `SELECT system_role FROM user_info WHERE user_id = $1;`;

const getAverageRating = `SELECT overall_rating FROM store_data WHERE owner_id = $1;`;
const getStoreRatings=`SELECT u.user_id, u.user_name, u.email, (sub.rating_obj->>'rating')::int AS rating 
FROM user_info u JOIN (
  SELECT jsonb_array_elements(user_ratings) AS rating_obj
  FROM store_data
  WHERE owner_id = 1
) sub
ON u.user_id = (sub.rating_obj->>'user_id')::int
ORDER BY u.user_id;`

const getStoresForu = "SELECT store_name, store_address, overall_rating FROM store_data;";
const searchStores = `
  SELECT store_name, store_address, overall_rating 
  FROM store_data 
  WHERE store_name ILIKE $1 OR store_address ILIKE $2;
`;
const submitRating = `
  UPDATE store_data
  SET user_ratings = user_ratings || $1::jsonb,
      overall_rating = (
        SELECT AVG((elem->>'rating')::FLOAT)
        FROM jsonb_array_elements(user_ratings || $1::jsonb) elem
      )
  WHERE store_id = $2
    AND NOT EXISTS (
      SELECT 1 FROM jsonb_array_elements(user_ratings) elem
      WHERE elem->>'user_id' = $3
    );
`;


module.exports={
    verifyUserCredentials,
    updatePassword,

    addUser,
    addStore,

    getTotalUser,
    getTotalStore,
    getTotalRatings,

    getUserRole,

    getUsers,
    getStoreOwners,
    getStores,   
    
    getStoreRatings,
    getAverageRating,

    getStoresForu,
    searchStores,
    submitRating


}