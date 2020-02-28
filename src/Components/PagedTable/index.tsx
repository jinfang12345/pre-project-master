import React, {
  ReactElement,
  useImperativeHandle,
  Ref,
  forwardRef,
  useCallback,
  ReactNode,
  useEffect,
  useRef,
  Fragment,
  useState,
} from 'react';
import { Table, TableProps, WidthCalcType, usePagedTable } from '@maxtropy/table';
import { Button, Input, Pagination, Select } from 'antd';
import { PagedRequest, PagedResponse } from '@maxtropy/kingfisher-api';

const { Option } = Select;

export interface PagedTableProps<D extends object> extends Pick<TableProps<D>, 'columns' | 'rowKey'> {
  widthType?: WidthCalcType;
  tableClassName?: string;
  paginationClassName?: string;
  /**
   * 这里request允许异步返回undefined，代表没有进行实际的请求。表格内容将不做任何更改。
   * @param pageInfo
   */
  request: (pageInfo: PagedRequest) => Promise<PagedResponse<D> | undefined>;
  initialPageSize?: number;
  initialPage?: number;
  setTrigger?: (callback: () => void) => void;
  pageName?: string;
  renderEmpty?: () => ReactNode;
}

export interface PagedTableHandle {
  update: () => void;
}

export function emptyPagedResponse<D>(): PagedResponse<D> {
  return {
    size: 10,
    totalElements: 0,
    totalPages: 0,
    numberOfElements: 0,
    number: 0,
    content: [],
  };
}

interface JumpToPageProps {
  maxPage: number;
  onPageChange: (page: number) => void;
}

const JumpToPage: React.FC<JumpToPageProps> = props => {
  const { maxPage, onPageChange } = props;
  const [page, setPage] = useState<string>();
  const doSetPage = useCallback(() => {
    const pageNum = Number(page);
    if (pageNum && pageNum > 0 && pageNum <= maxPage) {
      onPageChange(pageNum - 1);
    }
  }, [page, maxPage, onPageChange]);
  return (
    <div className="page-jumper">
      跳转至&nbsp;
      <Input style={{ width: 50 }} pattern="[0-9]+" value={page} onChange={e => setPage(e.target.value)} />
      &nbsp;页
      <Button style={{ marginLeft: 10 }} onClick={doSetPage}>
        确定
      </Button>
    </div>
  );
};

function TableFunc<D extends object>(props: PagedTableProps<D>, ref: Ref<PagedTableHandle>): ReactElement {
  const { request, tableClassName, paginationClassName, pageName } = props;

  const requestWithPageName = useCallback(
    async (pageInfo: PagedRequest): Promise<PagedResponse<D> | undefined> =>
      request({
        ...pageInfo,
        pageSource: pageName,
        'kingfisher-page-cache': !!pageName,
      }),
    [request, pageName],
  );

  const { tableData, pagination, doRequestData } = usePagedTable<D>({ request: requestWithPageName });

  const paginationRef = useRef(pagination);

  useEffect(() => {
    paginationRef.current.onPageChange(0);
  }, [request, paginationRef]);

  useImperativeHandle<{}, PagedTableHandle>(
    ref,
    () => ({
      update: (): void => {
        doRequestData().catch(console.error);
      },
    }),
    [doRequestData],
  );

  return (
    <div className="c-paged-table">
      <Table {...props} data={tableData} className={tableClassName} />
      {!pagination.totalElements && <div className="table-empty">{props.renderEmpty && props.renderEmpty()}</div>}
      <div className={'pagination-container ' + paginationClassName || ''}>
        {pagination.totalElements && pagination.pageSize ? (
          <Fragment>
            共有{pagination.totalElements}条&ensp;
            <Pagination
              className="pagination"
              current={pagination.currentPage + 1}
              pageSize={pagination.pageSize}
              total={pagination.totalElements}
              onChange={val => pagination.onPageChange(val - 1)}
            />
            <JumpToPage
              maxPage={Math.ceil(pagination.totalElements / pagination.pageSize)}
              onPageChange={pagination.onPageChange}
            />
            <div className="size-select">
              每页显示：
              <Select
                value={pagination.pageSize}
                defaultValue={10}
                onChange={(size: number) => pagination.onPageChange(0, size)}
              >
                <Option value={10}>10</Option>
                <Option value={20}>20</Option>
                <Option value={30}>30</Option>
                <Option value={50}>50</Option>
                <Option value={100}>100</Option>
              </Select>
            </div>
          </Fragment>
        ) : null}
      </div>
    </div>
  );
}

export function createPagedTable<D extends object>() {
  return forwardRef<PagedTableHandle, PagedTableProps<D>>(TableFunc);
}
