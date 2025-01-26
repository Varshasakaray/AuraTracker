import { getUserFromStorage } from "../../utils/getUserFromStorage";
import { BASE_URL } from "../../utils/url";
import axios from 'axios';

//Get the token
const token = getUserFromStorage();
//Add
export const AddSubjectAPI=async ({subject,credit,attendedClasses,totalClasses})=>{
    const response = await axios.post(`${BASE_URL}/subjects/create`,{
        subject,
        credit,
        attendedClasses,
        totalClasses,
    },{
        headers:{
            Authorization:`Bearer ${token}`,
        }
    });
    //return a promise
    return response.data;
}

//Register
export const listSubjectsAPI=async ()=>{
    const response = await axios.get(`${BASE_URL}/subjects/lists`,{
        headers:{
            Authorization:`Bearer ${token}`,
        }
    });
    //return a promise
    return response.data;
}

// //Update
// export const updateSubjectAPI=async ({subject,attendedClasses,totalClasses})=>{
//     const response = await axios.put(`${BASE_URL}/subjects/update/${id}`,{
//         subject,
//         attendedClasses,
//         totalClasses,
//     },{
//         headers:{
//             Authorization:`Bearer ${token}`,
//         }
//     });
//     //return a promise
//     return response.data;
// }


//Delete
// export const deleteTaskAPI=async (id)=>{
//     const response = await axios.delete(`${BASE_URL}/subjects/delete/${id}`,{
//         headers:{
//             Authorization:`Bearer ${token}`,
//         }
//     });
//     //return a promise
//     return response.data;
// }