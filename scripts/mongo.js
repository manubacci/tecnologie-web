const mongoose = require('mongoose');

const connection = {
    users: null,
    settings: null,
    calendars: null,
    events: null
};
let User;
let Settings;
let Calendar;
let Event;


exports.connect = async (credentials) => {
    try {
        connection.users = mongoose.createConnection(`mongodb://${credentials.username}:${credentials.password}@${credentials.site}/users?authSource=admin&writeConcern=majority`);
        connection.settings = mongoose.createConnection(`mongodb://${credentials.username}:${credentials.password}@${credentials.site}/settings?authSource=admin&writeConcern=majority`);
        connection.calendars = mongoose.createConnection(`mongodb://${credentials.username}:${credentials.password}@${credentials.site}/calendars?authSource=admin&writeConcern=majority`);
        connection.events = mongoose.createConnection(`mongodb://${credentials.username}:${credentials.password}@${credentials.site}/events?authSource=admin&writeConcern=majority`);
        connection.notes = mongoose.createConnection(`mongodb://${credentials.username}:${credentials.password}@${credentials.site}/notes?authSource=admin&writeConcern=majority`);

        const userSchema = new mongoose.Schema({
            username: { type: String, required: true, unique: true },
            email: { type: String, required: true, unique: true },
            password: { type: String, required: true },
            name: { type: String, required: true },
            birth: { type: Date, required: true },
            propic: { type: String }
        });
        User = connection.users.model('User', userSchema);

        const settingsSchema = new mongoose.Schema({
            user: { type: String, required: true, unique: true },
            theme: { type: String, required: true },
            color: { type: String, required: true },
            format: { type: String, required: true },
            seconds: { type: Boolean, required: true },
            invasive: { type: Boolean, required: true },
            order: { type: String, required: true }
        });
        Settings = connection.settings.model('Settings', settingsSchema);

        const calendarSchema = new mongoose.Schema({
            user: { type: String, required: true },
            title: { type: String, required: true },
            color: { type: String, required: true },
            show: { type: Boolean, required: true },
        });
        Calendar = connection.calendars.model('Calendar', calendarSchema);

        const eventSchema = new mongoose.Schema({
            user: { type: String, required: true },
            title: { type: String, required: true },
            calendar: { type: String, required: true },
            activity: { type: Boolean, required: true },
            daily: { type: Boolean, required: true },
            start: { type: Date, required: true },
            end: { type: Date, required: true },
            repetition: { type: Array, required: true },
            recurrence: { type: Array, required: true },
            notes: { type: String, required: true }
        });
        Event = connection.events.model('Event', eventSchema);

        const noteSchema = new mongoose.Schema({
            user: { type: String, required: true },
            title: { type: String, required: true },
            text: { type: String, required: true },
            date: { type: Date, required: true },
            update: { type: Date, required: true },
            tags: { type: Array, required: true }
        });
        Note = connection.notes.model('Note', noteSchema);

    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        throw error;
    }
};

exports.save = async (data, database) => {
    try {
        let prompt;
        switch (database) {
            case 'users':
                prompt = new User(data);
                break;
            case 'settings':
                prompt = new Settings(data);
                break;
            case 'calendars':
                prompt = new Calendar(data);
                break;
            case 'events':
                prompt = new Event(data);
                break;
            case 'notes':
                prompt = new Note(data);
                break;
        }
        const result = await prompt.save();
        return result;
    } catch (error) {
        console.error('Error while creating data:', error);
        throw error;
    }
}

exports.find = async (id, database, other) => {
    try {
        let result;
        switch (database) {
            case 'users':
                if (other)
                    result = await User.findOne({ email: { $regex: `^${other}$`, $options: 'i' } });
                else
                    result = await User.findOne({ username: { $regex: `^${id}$`, $options: 'i' } });
                break;
            case 'settings':
                result = await Settings.findOne({ user: id });
                break;
            case 'calendars':
                result = await Calendar.find({ user: id });
                break;
            case 'events':
                result = await Event.find({ user: id });
                break;
            case 'notes':
                result = await Note.find({ user: id });
                break;
        }
        return result;
    } catch (error) {
        console.error('Error while searching data:', error);
        throw error;
    }
}

exports.update = async (data, database, id) => {
    try {
        let result;
        switch (database) {
            case 'users':
                result = await User.findOneAndUpdate(
                    { username: data.username },
                    { $set: data },
                    { new: true, upsert: true });
                break;
            case 'settings':
                result = await Settings.findOneAndUpdate(
                    { user: data.user },
                    { $set: data },
                    { new: true, upsert: true });
                break;
            case 'calendars':
                if (id) {
                    result = await Calendar.findOneAndUpdate(
                        { _id: id },
                        { $set: data },
                        { new: true, upsert: true });
                } else
                    result = await Calendar.findOneAndUpdate(
                        { user: data.user, title: data.title },
                        { $set: data },
                        { new: true, upsert: true });
                break;
            case 'events':
                if (!data._id) {
                    data._id = new mongoose.Types.ObjectId();
                }
                result = await Event.findOneAndUpdate(
                    { _id: data._id },
                    { $set: data },
                    { new: true, upsert: true });
                break;
            case 'notes':
                if (!data._id) {
                    data._id = new mongoose.Types.ObjectId();
                }
                result = await Note.findOneAndUpdate(
                    { _id: data._id },
                    { $set: data },
                    { new: true, upsert: true });
                break;
        }
        return result;
    } catch (error) {
        console.error('Error while updating data:', error);
        throw error;
    }
}

exports.print = async (database) => {
    try {
        let result;
        switch (database) {
            case 'users':
                result = await User.find();
                break;
            case 'settings':
                result = await Settings.find();
                break;
            case 'calendars':
                result = await Calendar.find();
                break;
            case 'events':
                result = await Event.find();
                break;
            case 'notes':
                result = await Note.find();
                break;
        }
        return result;
    } catch (error) {
        console.error('Error while printing data:', error);
        throw error;
    }
}

exports.drop = async (id, database) => {
    try {
        if (!id) {
            await connection.users.db.dropDatabase();
            await connection.settings.db.dropDatabase();
            await connection.calendars.db.dropDatabase();
            await connection.events.db.dropDatabase();
        } else {
            switch (database) {
                case 'users':
                    await User.deleteOne({ username: id });
                    break;
                case 'settings':
                    await Settings.deleteOne({ user: id });
                    break;
                case 'calendars':
                    await Calendar.deleteOne({ _id: id });
                    break;
                case 'events':
                    await Event.deleteOne({ _id: id });
                    break;
                case 'notes':
                    await Note.deleteOne({ _id: id });
                    break;
            }
        }
    } catch (error) {
        console.error('Error while deleting data:', error);
        throw error;
    }
}

exports.purge = async () => {
    try {
        await connection.users?.db.dropDatabase();
        await connection.settings?.db.dropDatabase();
        await connection.calendars?.db.dropDatabase();
        await connection.events?.db.dropDatabase();
        await connection.notes?.db.dropDatabase();
    } catch (error) {
        console.error('Error while deleting all databases:', error);
        throw error;
    }
};

exports.dump = async () => {
    try {
        const users = await User.find();
        const settings = await Settings.find();
        const calendars = await Calendar.find();
        const events = await Event.find();
        const notes = await Note.find();

        return { users, settings, calendars, events, notes };
    } catch (error) {
        console.error('Error while generating dump:', error);
        throw error;
    }
};