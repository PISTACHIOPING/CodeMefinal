
import React, { useState } from 'react';
import { Icons } from '../components/Icons';
import { Contact } from '../types';

const mockContacts: Contact[] = [
    { id: '1', date: 'Oct 24, 2024', firstName: 'John', lastName: 'Doe', email: 'john@example.com', company: 'Tech Inc', jobTitle: 'Developer', website: 'https://tech.com', phone: '010-1234-5678', industry: 'Software' },
    { id: '2', date: 'Oct 25, 2024', firstName: 'Jane', lastName: 'Smith', email: 'jane@design.co', company: 'Creative Lab', jobTitle: 'Designer', website: 'https://design.co', phone: '010-9876-5432', industry: 'Design' },
    { id: '3', date: 'Oct 26, 2024', firstName: 'Mike', lastName: 'Johnson', email: 'mike@sales.net', company: 'Best Sales', jobTitle: 'Manager', website: 'https://sales.net', phone: '010-1111-2222', industry: 'Retail' },
];

const ContactsPage: React.FC = () => {
  const [contacts] = useState<Contact[]>(mockContacts);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
        newSelected.delete(id);
    } else {
        newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
      if (selectedIds.size === contacts.length) {
          setSelectedIds(new Set());
      } else {
          setSelectedIds(new Set(contacts.map(c => c.id)));
      }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Contacts</h1>

        {/* Toolbar */}
        <div className="flex items-center gap-3 mb-4">
            <span className="text-sm text-gray-500">{contacts.length} contact</span>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50">
                <Icons.Filter size={14} /> Filter
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50">
                <span className="text-gray-400">↓</span> Date
            </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto shadow-sm">
            <table className="w-full min-w-[1000px] text-sm text-left">
                <thead className="bg-gray-50 text-gray-700 font-medium border-b border-gray-200">
                    <tr>
                        <th className="p-4 w-12">
                            <input 
                                type="checkbox" 
                                className="rounded border-gray-300"
                                checked={selectedIds.size === contacts.length && contacts.length > 0}
                                onChange={toggleSelectAll}
                            />
                        </th>
                        <th className="p-4">Date</th>
                        <th className="p-4">First name</th>
                        <th className="p-4">Last name</th>
                        <th className="p-4">Email</th>
                        <th className="p-4">Company</th>
                        <th className="p-4">Job title</th>
                        <th className="p-4">Website URL</th>
                        <th className="p-4">Phone number</th>
                        <th className="p-4">Industry</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {contacts.map((contact) => (
                        <tr key={contact.id} className="hover:bg-gray-50 group">
                            <td className="p-4">
                                <input 
                                    type="checkbox" 
                                    className="rounded border-gray-300"
                                    checked={selectedIds.has(contact.id)}
                                    onChange={() => toggleSelect(contact.id)}
                                />
                            </td>
                            <td className="p-4 text-gray-600">{contact.date}</td>
                            <td className="p-4 text-gray-900">{contact.firstName}</td>
                            <td className="p-4 text-gray-900">{contact.lastName}</td>
                            <td className="p-4 text-gray-600">{contact.email}</td>
                            <td className="p-4 text-gray-600">{contact.company}</td>
                            <td className="p-4 text-gray-600">{contact.jobTitle}</td>
                            <td className="p-4 text-blue-500 hover:underline cursor-pointer">{contact.website}</td>
                            <td className="p-4 text-gray-600">{contact.phone}</td>
                            <td className="p-4 text-gray-600">
                                <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                                    {contact.industry}
                                </span>
                            </td>
                        </tr>
                    ))}
                    {contacts.length === 0 && (
                        <tr>
                            <td colSpan={10} className="p-8 text-center text-gray-500">
                                No contacts found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default ContactsPage;
