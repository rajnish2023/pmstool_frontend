import React, { useState } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'

const Roles = () => {
    const [searchTerm, setSearchTerm] = useState('')

    const data = [
        { id: 1, firstName: 'Mark', lastName: 'Otto', handle: '@mdo' },
        { id: 2, firstName: 'Jacob', lastName: 'Thornton', handle: '@fat' },
        { id: 3, firstName: 'Larry', lastName: 'the Bird', handle: '@twitter' },
    ]

    const filteredData = data.filter(item =>
        item.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.handle.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <CRow>
            <CCol xs={12}>
                <CCard className="mb-4">
                    <CCardHeader>
                        <strong>Table Name</strong>
                    </CCardHeader>
                    <CCardBody>
                        <input
                            type="text"
                            placeholder="Search"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="mb-3 form-control"
                            style={{ maxWidth: '230px', marginLeft: 'auto' }}
                        />
                        <CTable striped className="table table-hover">
                            <CTableHead>
                                <CTableRow>
                                    <CTableHeaderCell scope="col">#</CTableHeaderCell>
                                    <CTableHeaderCell scope="col">Role</CTableHeaderCell>
                                    <CTableHeaderCell scope="col">Permissions</CTableHeaderCell>
                                    <CTableHeaderCell scope="col">Action</CTableHeaderCell>
                                </CTableRow>
                            </CTableHead>
                            <CTableBody>
                                {filteredData.map(item => (
                                    <CTableRow key={item.id}>
                                        <CTableHeaderCell scope="row">{item.id}</CTableHeaderCell>
                                        <CTableDataCell>{item.firstName}</CTableDataCell>
                                        <CTableDataCell>{item.lastName}</CTableDataCell>
                                        <CTableDataCell>{item.handle}</CTableDataCell>
                                    </CTableRow>
                                ))}
                            </CTableBody>
                        </CTable>
                    </CCardBody>
                </CCard>
            </CCol>
        </CRow>
    )
}

export default Roles