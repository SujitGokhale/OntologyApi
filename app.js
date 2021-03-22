'use strict'

const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const config = require('./config.json');

const app = express();

const mockData = config.mockData;

let concepts = [];

app.use(cors({
    origin: config.corsUrl
}));

app.use(express.urlencoded({extended:true}));
app.use(express.json());

const connection = mockData ? null : mysql.createConnection(config.DBConnection);

app.post('/concept', (req, res) => {
    try{
        const concept = req.body;

        if (mockData === true){
            console.log(concept);
            concept.id = concepts.length + 1;
            concepts.push(concept);
            res.send({message:`Concept is added successfully with Id: ${concepts.length}`});
        }
        else{
            var conceptData  = {
                DisplayName:concept.displayName,
                ConceptDescription:concept.description,
                AlternateNames:concept.alternateNames,
                Parents:concept.parents,
                Children:concept.children
            };
            
            var query = connection.query('INSERT INTO OntologyConcept SET ?', conceptData, function (error, results, fields) {
                if (error) {
                    return res.status(500).send({
                        message: `Error while inserting a new concept - ${error.toString()}`
                    });
                }
                else{
                    return res.send({message:`Concept is added successfully with Id: ${results.insertId}`});
                }
            });
        }
    }
    catch(error){
        return res.status(500).send({
            message: `Error while adding concept - ${error.toString()}`
         });
    }
})

app.get('/concept', (req, res) => {
    try{
        if (mockData === true){
            res.json(concepts);
        }
        else{
            var query = connection.query('SELECT * FROM OntologyConcept', null, function (error, results, fields) {
                if (error) {
                    return res.status(500).send({
                        message: `Error while retrieving concepts - ${error.toString()}`
                    });
                }
                else{
                    if (results){
                        let concepts = [];
                        results.forEach(element => {
                            concepts.push({
                                id:element.Id,
                                displayName:element.DisplayName,
                                description:element.ConceptDescription,
                                alternateNames: element.AlternateNames,
                                parents:element.Parents,
                                children:element.Children
                            });
                        });

                        res.json(concepts);
                        return;
                    }
                    res.json([]);
                    return;
                    //res.status(404).send({message:'Concepts not found'});
                }
            });
        }
    }
    catch(error){
        return res.status(500).send({
            message: `Error while getting all concepts - ${error.toString()}`
        });
    }
});

app.get('/concept/:id', (req, res) => {
    const id = Number(req.params.id);

    try{
        if (mockData === true){
            for (let concept of concepts) {
                if (concept.id === id) {
                    res.json(concept);
                    return;
                }
            }

            res.status(404).send({message:'Concept not found'});
        }
        else{
            var query = connection.query('SELECT * FROM OntologyConcept WHERE id = ?', id, function (error, results, fields) {
                if (error) {
                    return res.status(500).send({
                        message: `Error while retrieving concept details for id ${id} - ${error.toString()}`
                    });
                }
                else{
                    if (results){
                        res.json({
                            id:results[0].Id,
                            displayName:results[0].DisplayName,
                            description:results[0].ConceptDescription,
                            alternateNames: results[0].AlternateNames,
                            parents:results[0].Parents,
                            children:results[0].Children
                        });
                        return;
                    }
                    res.status(404).send({message:'Concept not found'});
                }
            });
        }
    }
    catch(error){
        return res.status(500).send({
            message: `Error while getting a concept for id ${id} - ${error.toString()}`
        });
    }
});

app.delete('/concept/:id', (req, res) => {
    const id = Number(req.params.id);

    try{
        if (mockData === true){
            concepts = concepts.filter(i => {
                if (i.id !== id) {
                    return true;
                }
                return false;
            });
            res.send({message:'Concept is deleted'});
        }
        else {
            var query = connection.query('DELETE FROM OntologyConcept WHERE id = ?', id, function (error, results, fields) {
                if (error) {
                    return res.status(500).send({
                        message: `Error while deleting concept for id ${id} - ${error.toString()}`
                    });
                }
                else{
                    return res.send({message:`Concept is deleted`});
                }
            });
        }
    }
    catch(error){
        return res.status(500).send({
            message: `Error while deleting a concept for id ${id} - ${error.toString()}`
        });
    }
});

app.put('/concept/:id', (req, res) => {
    const id = Number(req.params.id);
    const newConcept = req.body;

    try{
        if (mockData === true){
            for (let i = 0; i < concepts.length; i++) {
                let concept = concepts[i]
                if (concept.id === id) {
                    concepts[i] = newConcept;
                }
            }

            res.send({message:'Concept is updated'});
        }
        else{
            
            let displayName = newConcept.displayName;
            let description = newConcept.description;
            let alternateNames = newConcept.alternateNames;
            let parents = newConcept.parents;
            let children = newConcept.children;
            
            var query = connection.query('UPDATE OntologyConcept SET DisplayName = ?, ConceptDescription = ?, AlternateNames = ?, Parents = ?, Children = ? WHERE id = ?', 
                    [displayName,
                    description,
                    alternateNames,
                    parents,
                    children, 
                    id], function (error, results, fields) {
                if (error) {
                    return res.status(500).send({
                        message: `Error while updating concept ${newConcept.displayName} - ${error.toString()}`
                    });
                }
                else{
                    return res.send({message:`Concept is updated`});
                }
            });
        }
    }
    catch(error){
        return res.status(500).send({
            message: `Error while updating a concept ${newConcept.displayName} - ${error.toString()}`
        });
    }
});

module.exports = app
